import { JSX, useContext } from "react";
import { Setting } from "@repo/shared";
import { WikipediaPageInput } from "./wikipedia_page_input";
import { WikipediaLanguageInput } from "./wikipedia_language_input";
import { WebsocketContext } from "../../context/websocket_context";

export default function SettingInput({ settings, id }: {
	settings: Setting,
	id: string
}) {
	const { websocket, forceUpdate } = useContext(WebsocketContext);

	if (!websocket) {
		return <></>;
	}

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
}