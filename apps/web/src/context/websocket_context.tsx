import { Context, createContext } from "react";
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