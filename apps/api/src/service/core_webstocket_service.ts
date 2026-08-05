import { WebSocketServer } from "ws";
import RoomsService from "./rooms_service";
import { Room } from "../struct/room";
import { WebSocketClient } from "../struct/websocket_client";
import { generateString } from "../util/random_util";

export default class CoreWebsocketService {

	public static INSTANCE: CoreWebsocketService = new CoreWebsocketService();

	// TODO : Store WS clients

	public initialize(): void {
		console.log("Initializing CoreWebsocketService");

		const PORT = parseInt(process.env.PORT ?? "") || 3000;
		const wss = new WebSocketServer({ port: PORT }, () => {
			console.log(`Ready`);
		});

		wss.on("connection", (ws, req) => {
			console.log(`Websocket connection connected: ${ws}`);
			const urlSearchParams = new URLSearchParams(req.url?.split("?").slice(1).join("?"));

			const id = urlSearchParams.get("id"); // TODO : Action to create game
			const name = urlSearchParams.get("name");
			const roomName = urlSearchParams.get("roomName");
			const password = urlSearchParams.get("password");
			const action = urlSearchParams.get("action");

			if (name === null || name === ""
				|| action === null || action === ""
				|| ((id === null || id === "") && action !== "create")
				|| ((roomName === null || roomName === "") && action === "create")) {
				// TODO
				console.log("Missing argument");
				ws.close(3000);
				return;
			}

			let room: Room | undefined;
			if (action === "create") {
				room = RoomsService.INSTANCE.createRoom(roomName ?? "", password);
				console.log("Creating");
			} else {
				room = RoomsService.INSTANCE.getRoom(id ?? "");

				if (room && !room.checkPassword(password)) {
					// TODO
					console.log("Invalid pswd");
					return;
				}
				console.log("Joining");
			}

			if (room === undefined) {
				// TODO
				console.log("No room");
				ws.close(3000);
				return;
			}

			console.log("Success");

			const clientId = generateString(10);
			// eslint-disable-next-line
			// @ts-ignore
			const wsClient = new WebSocketClient(ws, clientId);
			wsClient.setRoomId(room.id);

			// TODO : Store WS

			setTimeout(() => {
				RoomsService.INSTANCE.registerPlayer(room, wsClient, name, clientId);
			}, 100);

			// TODO : Generate player id
		});
	}
}