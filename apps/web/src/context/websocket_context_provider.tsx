import { ReactNode, useReducer, useState } from "react";
import WebsocketPlayer from "../ws/websocket_player";
import { WebsocketContext } from "./websocket_context";
import config from "../config.json";

export function WebsocketProvider({ children }: { children: ReactNode }) {
	const [ws, setWS] = useState<undefined | WebsocketPlayer>();
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	return <WebsocketContext.Provider value={{
		websocket: ws,
		createWebsocket: ({ name, roomName, id, password }) => {
			let ws;
			if (id) {
				ws = new WebSocket(`${config.apiUrl}/ws?id=${id}&action=join&name=${name}${password ? `&password=${password}` : ""}`);
			} else {
				ws = new WebSocket(`${config.apiUrl}/ws?roomName=${roomName}&action=create&name=${name}${password ? `&password=${password}` : ""}`);
			}

			const wsPlayer = new WebsocketPlayer(ws, forceUpdate);

			setWS(wsPlayer);
		},
	}}>{children}</WebsocketContext.Provider>;
}
