import { useContext } from "react";
import { WebsocketContext } from "../../context/websocket_context";
import { AvailableGames, GameTypes } from "@repo/shared/src/struct/game";

export function GameLobby() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected) {
		return <></>;
	}

	return <div className={"flex flex-col p-8 border border-gray-800 rounded-xl gap-4 w-240 max-w-[90%] m-auto"}
		style={{
			background: "linear-gradient(270deg, #230058 0%, #140033 48.56%, #0E0023 100%)",
		}}>
		<h1>Room code: {websocket.getRoom()?.id}</h1>
		<hr className={"text-[#676767]"} />
		<div className={"flex mx-auto w-240 gap-8"}>
			<div className={"w-108"}>
				<h3>Players</h3>
				<div className={"mt-4"}>
					{[...websocket.getRoom()?.players.values() ?? []].map((player, id) => {
						return <p key={id}>{player.name}</p>;
					})}
				</div>
			</div>
			<div className={"w-108 flex flex-col"}>
				<h3>Settings</h3>
				<label htmlFor={"game"}
					className={"mt-4"}>Game</label>
				<select id={"game"}
					value={websocket.getRoom()!.game.type}
					disabled={!websocket.isRoomOwner()}
					onChange={(e) => {
						const value = e.target.value;

						if (value === websocket.getRoom()!.game.type) {
							return;
						}

						websocket.send("setType", value as GameTypes);
					}}>
					{Object.entries(AvailableGames).map(([id, game]) => {
						return <option id={id}
							key={id}
							value={id}>{game.name}</option>;
					})}
				</select>
				{Object.entries(websocket?.getRoom()?.game.settings ?? {}).map(([id, settings]) => {
					return <div className={"mt-4"}>
						<label htmlFor={id}>{settings.name}</label>
						<input type={settings.type}
							disabled={!websocket.isRoomOwner()}
							value={settings.value}
							onChange={(e) => {
								const value = e.target.value;

								if (settings.type === "number") {
									settings.value = parseInt(value, 10);
								} else {
									// @ts-ignore
									settings.value = value;
								}

								websocket.send("setSettings", websocket?.getRoom()?.game.settings);
							}} />
					</div>;
				})}
			</div>
		</div>
		{websocket.isRoomOwner() && <button
			onClick={() => {
				websocket?.send("startGame");
			}}
			className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Start game
		</button>}
	</div>;
}