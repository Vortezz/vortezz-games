import { WebSocketServer } from "ws";
import RoomsService from "./rooms_service";
import { Room } from "../struct/room";
import { WebSocketClient } from "../struct/websocket_client";
import { generateString } from "@repo/shared";
import "colorts/lib/string";

export default class CoreWebsocketService {

	public static INSTANCE: CoreWebsocketService = new CoreWebsocketService();

	public readonly clients: Map<string, WebSocketClient> = new Map<string, WebSocketClient>();

	public initialize(): void {
		console.log(`[${"INFO / WS".blue}] Initializing websocket service`);

		const PORT = parseInt(process.env.PORT ?? "") || 3334;
		const wss = new WebSocketServer({ port: PORT }, () => {
			console.log(`[${"INFO / WS".blue}] Websocket service started`);
		});

		wss.on("connection", (ws, req) => {
			const urlSearchParams = new URLSearchParams(req.url?.split("?").slice(1).join("?"));

			const id = urlSearchParams.get("id");
			const playerId = urlSearchParams.get("playerId");
			let name = urlSearchParams.get("name");
			const roomName = urlSearchParams.get("roomName");
			const password = urlSearchParams.get("password");
			const action = urlSearchParams.get("action");

			if (action === null || action === ""
				|| ((playerId === null || playerId === "") && action === "rejoin")
				|| ((name === null || name === "") && action !== "rejoin")
				|| ((id === null || id === "") && action !== "create")
				|| ((roomName === null || roomName === "") && action === "create")) {
				ws.send(JSON.stringify({
					type: "error",
					data: "Invalid URL",
				}));
				ws.close(3000);
				return;
			}

			let room: Room | undefined;
			let clientId = generateString(10);
			if (action === "create") {
				room = RoomsService.INSTANCE.createRoom(roomName ?? "", password);
			} else if (action === "join") {
				room = RoomsService.INSTANCE.getRoom(id ?? "");

				if (room && room.password && !password) {
					ws.send(JSON.stringify({
						type: "needsPassword",
						data: `?id=${id}&name=${name}&needs_password=1`,
					}));
					ws.close(3000);
					return;
				}

				if (room && !room.checkPassword(password)) {
					ws.send(JSON.stringify({
						type: "error",
						data: "Invalid password",
					}));
					ws.close(3000);
					return;
				}
			} else if (action === "rejoin") {
				clientId = playerId ?? clientId;

				const [recoveredPlayer, recoveredRoom] = RoomsService.INSTANCE.tryRejoin(clientId, id ?? "");

				if (!recoveredPlayer) {
					ws.close(4003); // Rejoin not possible
					return;
				}

				name = recoveredPlayer.name;
				room = recoveredRoom;
			}

			if (room === undefined) {
				ws.send(JSON.stringify({
					type: "error",
					data: "Invalid room code",
				}));
				ws.close(3000);
				return;
			}

			// eslint-disable-next-line
			// @ts-ignore
			const wsClient = new WebSocketClient(ws, clientId);
			wsClient.setRoomId(room.id);

			this.clients.set(wsClient.getId(), wsClient);

			ws.on("close", () => {
				this.clients.delete(wsClient.getId());
			});

			setTimeout(() => {
				RoomsService.INSTANCE.registerPlayer(room, wsClient, name ?? "", clientId, action === "rejoin");
			}, 100);
		});
	}
}
