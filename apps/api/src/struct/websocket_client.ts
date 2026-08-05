import { AbstractWebSocket } from "@repo/shared";

export class WebSocketClient extends AbstractWebSocket {

	private readonly id: string;

	constructor(ws: WebSocket, id: string) {
		super(ws);

		this.id = id;
	}

	public getId() {
		return this.id;
	}
}