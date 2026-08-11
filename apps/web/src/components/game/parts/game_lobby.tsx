import { useContext } from "react";
import { WebsocketContext } from "../../../context/websocket_context";
import { AvailableGames, GameTypes } from "@repo/shared/src/struct/game";
import { WikipediaPageInput } from "../../input/wikipedia_page_input";

export function GameLobby() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected) {
		return <></>;
	}

	return <div className={"game-container gradient-reverse"}>
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
					let settingInput: JSX.Element;

					if (settings.type === "wikipage") {
						settingInput = <>
							<label htmlFor={id}>{settings.name}</label>
							<WikipediaPageInput value={settings.value}
								setValue={(value) => {
									settings.value = value;

									websocket.send("setSettings", websocket?.getRoom()?.game.settings);
								}}
								disabled={!websocket.isRoomOwner()} />
						</>;
					} else if (settings.type === "boolean") {
						settingInput = <div className={"flex items-center gap-4"}>
							<input type={"checkbox"}
								className={"h-4 p-0 w-4"}
								id={id}
								value={settings.value}
								onChange={(e) => {
									settings.value = e.target.checked;

									websocket.send("setSettings", websocket?.getRoom()?.game.settings);
								}}
								disabled={!websocket.isRoomOwner()} />
							<label htmlFor={id}
								className={"h-fit"}>{settings.name}</label>
						</div>;
					} else {
						settingInput = <>
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
						</>;
					}

					return <div className={"mt-4"}>
						{settingInput}
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