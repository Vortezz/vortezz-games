import { Context, createContext, useReducer, useState } from "react";
import WebsocketPlayer from "../ws/websocket_player";

export type WebsocketContextProps = {
	websocket: undefined | WebsocketPlayer;
	createWebsocket: ({ name, roomName, id, password }: {
		name: string,
		roomName?: string
		id?: string
		password?: string
	}) => void;
};

export const WebsocketContext: Context<WebsocketContextProps> = createContext<WebsocketContextProps>({
	websocket: undefined,
	createWebsocket: () => {
	},
});

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
	const [ws, setWS] = useState<undefined | WebsocketPlayer>();
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	return <WebsocketContext.Provider value={{
		websocket: ws,
		createWebsocket: ({ name, roomName, id, password }) => {
			let ws;
			if (id) {
				ws = new WebSocket(`ws://localhost:3000/?id=${id}&action=join&name=${name}${password ? `&password=${password}` : ""}`);
			} else {
				ws = new WebSocket(`ws://localhost:3000/?roomName=${roomName}&action=create&name=${name}${password ? `&password=${password}` : ""}`);
			}

			const wsPlayer = new WebsocketPlayer(ws, forceUpdate);

			setWS(wsPlayer);
		},
	}}>{children}</WebsocketContext.Provider>;
}