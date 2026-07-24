import { Context, createContext, useState } from "react";
import WebSocketPlayer from "../ws/WebSocketPlayer";

export type WebsocketContextProps = {
	websocket: undefined | WebSocketPlayer;
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
	const [ws, setWS] = useState<undefined | WebSocketPlayer>();

	return <WebsocketContext.Provider value={{
		websocket: ws,
		createWebsocket: ({ name, roomName, id, password }) => {
			let ws;
			if (id) {
				ws = new WebSocket(`ws://localhost:3000/?id=${id}&action=join&name=${name}${password ? `&password=${password}` : ""}`);
			} else {
				ws = new WebSocket(`ws://localhost:3000/?roomName=${roomName}&action=create&name=${name}${password ? `&password=${password}` : ""}`);
			}

			const wsPlayer = new WebSocketPlayer(ws);

			setWS(wsPlayer);
		},
	}}>{children}</WebsocketContext.Provider>;
}