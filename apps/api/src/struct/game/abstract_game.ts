import { Room } from "../room";
import { AvailableGames, CoreMessageTypings, Events, GameTypes, GameTypings } from "@repo/shared";
import { WebSocketClient } from "../websocket_client";

type Handler<E extends keyof Events> = (data: Events[E]) => void;

export abstract class AbstractGame<E extends CoreMessageTypings> implements GameTypings<E> {

	readonly type: GameTypes;
	settings: any;
	readonly room: Room;
	results = undefined;

	private isStarted = false;

	protected constructor(room: Room, type: GameTypes) {
		this.room = room;
		this.settings = AvailableGames[type].settings;
		this.type = type;
	}

	public startGame() {
		this.isStarted = true;

		// to be overridden
	}

	public endGame() {
		// to be overridden
	}

	public registerClient(ws: WebSocketClient) {
		// to be overridden
	}

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
		this.getRoom().broadcast("gameEvent", { type: key, data });
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		// to be overridden
	}
}

export class DefaultGame extends AbstractGame<CoreMessageTypings> {

	public constructor(room: Room) {
		super(room, "default");
	}
}

export interface GameEvent {
	event: string;
	data: never;
}