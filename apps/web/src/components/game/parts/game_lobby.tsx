import { JSX, useContext, useEffect, useState } from "react";
import { WebsocketContext } from "../../../context/websocket_context";
import { AvailableGames, GameTypes, Setting, validateSetting } from "@repo/shared";
import { WikipediaPageInput } from "../../input/wikipedia_page_input";
import copy from "../../../resources/copy.svg";
import share from "../../../resources/share.svg";
import crown from "../../../resources/icons/crown.svg";
import { NotificationContext } from "../../../context/notification_context";
import { WikipediaLanguageInput } from "../../input/wikipedia_language_input";

export function GameLobby() {
	const { websocket, forceUpdate } = useContext(WebsocketContext);
	const { showNotification } = useContext(NotificationContext);

	const [settingsValid, setSettingsValid] = useState<boolean>(false);

	useEffect(() => {
		const settingsValidations = [];

		const settings = websocket?.getRoom()?.game.settings ?? {};
		for (const [key, settingUkn] of Object.entries(settings)) {
			const setting = settingUkn as Setting;

			settingsValidations.push(validateSetting(setting.type, setting.value, key, settings));
		}

		Promise.all(settingsValidations).then((bools) => {
			const allValidated = bools.reduce((a, b) => a && b, true);

			console.log(allValidated);

			setSettingsValid(allValidated);
		});
	}, [websocket?.getSettingsVersion()]);

	if (!websocket || !websocket.isConnected) {
		return <></>;
	}

	return <div className={"game-container gradient-reverse"}>
		<div className={"flex items-center justify-between w-full"}>
			<div className={"flex flex-col"}>
				<span className={"uppercase text-gray-400"}>Room code</span>
				<h1>{websocket.getRoom()?.id}</h1>
			</div>
			<div className={"flex gap-4 items-center"}>
				<img src={copy}
					onClick={() => {
						showNotification("info", "Code copied to clipboard");

						return navigator.clipboard.writeText(websocket.getRoom()?.id ?? "");
					}}
					alt={"copy"}
					className={"h-8 stroke-white cursor-pointer"} />
				<img src={share}
					onClick={() => {
						showNotification("info", "Link copied to clipboard");

						return navigator.clipboard.writeText(`https://vrtz.dev/g/${websocket.getRoom()?.id ?? ""}`);
					}}
					alt={"share"}
					className={"h-8 stroke-white cursor-pointer"} />
			</div>
		</div>
		<hr className={"text-[#676767]"} />
		<div className={"flex mx-auto w-240 gap-8"}>
			<div className={"w-108"}>
				<h3>Players</h3>
				<div className={"mt-4 flex flex-col gap-2"}>
					{[...websocket.getRoom()?.players.values() ?? []].map((player, id) => {
						return <div className={"flex items-center gap-2"}
							key={id}>
							<p className={websocket.isRoomOwner() && websocket.getPlayerId() !== player.id ? "hover:line-through cursor-pointer" : undefined}
								onClick={websocket.isRoomOwner() && websocket.getPlayerId() !== player.id ? () => {
									websocket.send("kickPlayer", player.id);
								} : undefined}>{player.name}</p>
							{player.owner && <img src={crown}
								alt={"👑"}
								className={"h-4 w-4"} />}
							{player.id === websocket.getPlayerId() && <span className={"text-gray-400"}>(YOU)</span>}
						</div>;
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
								setValue={websocket.isRoomOwner() ? (value) => {
									if (value === settings.value) {
										return;
									}

									websocket.send("setSetting", {
										name: id,
										value: value,
									});

									settings.value = value;

									forceUpdate();
								} : () => {
								}}
								lang={websocket?.getRoom()?.game.settings.language.value ?? "en"}
								disabled={!websocket.isRoomOwner()} />
						</>;
					} else if (settings.type === "wikilanguage") {
						settingInput = <>
							<label htmlFor={id}>{settings.name}</label>
							<WikipediaLanguageInput value={settings.value}
								setValue={(value) => {
									if (value === settings.value) {
										return;
									}

									websocket.send("setSetting", {
										name: id,
										value: value,
									});
								}}
								disabled={!websocket.isRoomOwner()} />
						</>;
					} else if (settings.type === "boolean") {
						settingInput = <div className={"flex items-center gap-4"}>
							<input type={"checkbox"}
								className={"h-4 p-0 w-4"}
								id={id}
								checked={settings.value}
								onChange={websocket.isRoomOwner() ? (e) => {
									const value = e.target.checked;

									if (value === settings.value) {
										return;
									}

									websocket.send("setSetting", {
										name: id,
										value: value,
									});
								} : undefined}
								disabled={!websocket.isRoomOwner()} />
							<label htmlFor={id}
								className={"h-fit"}>{settings.name}</label>
						</div>;
					} else if (settings.type === "choice") {
						settingInput = <>
							<label htmlFor={id}>{settings.name}</label>
							<select id={id}
								value={settings.value}
								disabled={!websocket.isRoomOwner()}
								onChange={(e) => {
									const value = e.target.value;

									if (value === settings.value) {
										return;
									}

									websocket.send("setSetting", {
										name: id,
										value: value,
									});
								}}>
								{settings.data!.map((choice) => {
									return <option id={choice.name}
										key={choice.id}
										value={choice.id}>{choice.name}</option>;
								})}
							</select>
						</>;
					} else {
						settingInput = <>
							<label htmlFor={id}>{settings.name}</label>
							<input type={settings.type}
								id={id}
								disabled={!websocket.isRoomOwner()}
								value={settings.value}
								onChange={websocket.isRoomOwner() ? (e) => {
									let value: any = e.target.value;

									if (settings.type === "number") {
										value = parseInt(value, 10);
									}

									if (value === settings.value) {
										return;
									}

									websocket.send("setSetting", {
										name: id,
										value: value,
									});
								} : undefined} />
						</>;
					}

					return <div className={"mt-4"}
						key={id}>
						{settingInput}
					</div>;
				})}
			</div>
		</div>
		{websocket.isRoomOwner() && <button
			onClick={() => {
				websocket?.send("startGame");
			}}
			disabled={!settingsValid}
			className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Start game
		</button>}
	</div>;
}