import { AbstractGame } from "./abstract_game";
import { Room } from "../room";
import { WebSocketClient } from "../websocket_client";
import { BlindtestMessageTypings } from "@repo/shared";

export class BlindtestGame extends AbstractGame<BlindtestMessageTypings> {

	public constructor(room: Room) {
		super(room, "blindtest");
	}

	public startGame() {
		super.startGame();

	}

	public registerClient(ws: WebSocketClient) {
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
	}
}