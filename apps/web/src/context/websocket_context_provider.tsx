import { ReactNode, useContext, useEffect, useReducer, useState } from "react";
import WebsocketPlayer from "../ws/websocket_player";
import { WebsocketContext } from "./websocket_context";
import config from "../config.json";
import { NotificationContext } from "./notification_context";

export function WebsocketProvider({ children }: { children: ReactNode }) {
	const [ws, setWS] = useState<undefined | WebsocketPlayer>();
	const [, forceUpdate] = useReducer(x => x + 1, 0);
	const [askForRejoin, setAskForRejoin] = useState(false);

	const { showNotification } = useContext(NotificationContext);

	useEffect(() => {
		const lastGame = JSON.parse(localStorage.getItem("lastGame") ?? "{}");

		if (!lastGame.playerId || !lastGame.roomId || !lastGame.timestamp) {
			return;
		}

		if (Date.now() - lastGame.timestamp < 60 * 1000) {
			setAskForRejoin(true);

			setTimeout(() => {
				setAskForRejoin(oldValue => {
					if (oldValue) {
						showNotification("warning", "Rejoin wasn't attempted after 10 seconds");

						localStorage.removeItem("lastGame");
					}

					return false;
				});
			}, 10000);
		}
	}, []);

	function createWebsocket({ name, roomName, id, password, playerId }: {
		name?: string;
		roomName?: string | undefined;
		id?: string | undefined;
		password?: string | undefined;
		playerId?: string | undefined;
	}) {
		let ws;
		if (playerId && id) {
			ws = new WebSocket(`${config.apiUrl}/ws?id=${id}&playerId=${playerId}&action=rejoin`);
		} else if (id) {
			ws = new WebSocket(`${config.apiUrl}/ws?id=${id}&action=join&name=${name}${password ? `&password=${password}` : ""}`);
		} else {
			ws = new WebSocket(`${config.apiUrl}/ws?roomName=${roomName}&action=create&name=${name}${password ? `&password=${password}` : ""}`);
		}

		const wsPlayer = new WebsocketPlayer(ws, forceUpdate, showNotification);

		setWS(wsPlayer);
	}

	return <WebsocketContext.Provider value={{
		websocket: ws,
		createWebsocket: createWebsocket,
		forceUpdate,
	}}>
		{askForRejoin &&
			<div className={"fixed flex h-screen w-full bg-black/70 cursor-pointer"}
				onClick={() => {
					setAskForRejoin(false);

					localStorage.removeItem("lastGame");
				}}>
				<div className={"m-auto bg-[#0E0023] flex flex-col gap-8 p-8 border border-gray-800 rounded-xl cursor-default"}>
					<p>Do you want to rejoin your previous game?</p>
					<div className={"flex gap-4 mx-auto"}>
						<button className={"bg-green-400 rounded-md py-2 px-4 mx-auto cursor-pointer"}
							onClick={() => {
								const lastGame = JSON.parse(localStorage.getItem("lastGame") ?? "{}");

								setAskForRejoin(false);

								if (!lastGame.playerId || !lastGame.roomId || !lastGame.timestamp) {
									return;
								}

								createWebsocket({
									id: lastGame.roomId,
									playerId: lastGame.playerId,
								});
							}}>Yes
						</button>
						<button className={"bg-red-400 rounded-md py-2 px-4 mx-auto cursor-pointer"}
							onClick={() => {
								setAskForRejoin(false);

								localStorage.removeItem("lastGame");
							}}>No
						</button>
					</div>
				</div>
			</div>
		}
		{children}
	</WebsocketContext.Provider>;
}
