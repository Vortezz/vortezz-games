import { Room, WebSocketClient } from "@repo/shared";
import { router } from "../router";

export default class WebSocketPlayer extends WebSocketClient {

	private room: Room | undefined;

	constructor(ws: WebSocket) {
		super(ws);

		this.on("roomData", (data) => {
			// this.setRoomId((data as Room).getId());

			this.room = data;

			router.navigate("/game");
		});

		this.on("playerJoined", (data) => {

		})

		setInterval(() => {
			this.send("ping");
		}, 30000);
	}

	public isConnected() {
		return this.room !== undefined;
	}

	public getRoom() {
		return this.room;
	}
}