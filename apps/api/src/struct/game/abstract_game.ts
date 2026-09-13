import { Room } from "../room";
import { AvailableGames, CoreMessageTypings, Events, GameTypes, GameTypings } from "@repo/shared";
import { WebSocketClient } from "../websocket_client";

type Handler<E extends keyof Events> = (data: Events[E]) => void;

export abstract class AbstractGame<E extends CoreMessageTypings> implements GameTypings {

	readonly type: GameTypes;
	settings: any;
	readonly room: Room;
	results = undefined;
	public startedAt: number | undefined;

	private isStarted = false;

	protected constructor(room: Room, type: GameTypes) {
		this.room = room;
		this.settings = JSON.parse(JSON.stringify(AvailableGames[type].settings));
		this.type = type;
	}

	public startGame() {
		this.isStarted = true;

		this.startedAt = Date.now();

		// to be overridden
	}

	public endGame() {
		// to be overridden
	}

	public registerClient(ws: WebSocketClient) {
		// to be overridden
	}

	public abstract getState(id: string): any;

	public getType() {
		return this.type;
	}

	public getRoom() {
		return this.room;
	}

	public isGameStarted() {
		return this.isStarted;
	}

	public broadcast<K extends keyof E>(key: K, data?: E[K]) {
		this.getRoom().broadcast("gameEvent", { type: key as string, data });
	}

	protected sendGame<K extends keyof E>(websocket: WebSocketClient, key: K, data?: E[K]) {
		websocket.send("gameEvent", { type: key as string, data });
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		// to be overridden
	}

	public handleSettingChange(name: string, value: any) {
		// to be overridden
	}
}

export interface GameEvent {
	event: string;
	data: never;
}