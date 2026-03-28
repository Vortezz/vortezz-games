import { WebSocketClient } from "./websocket_client";
import { CoreMessageTypings } from "../message/core_message_type";
import { Room } from "./room";

export interface GamePlayer {
	id: string;
	name: string;
	owner: boolean;
	ws: WebSocketClient | undefined;
}

export interface Events {
	playerAdded: GamePlayer;
}

type Handler<E extends keyof Events> = (data: Events[E]) => void;

export type GameTypes = "default" | "rps";

export abstract class AbstractGame<E extends CoreMessageTypings> {

	private readonly type: GameTypes;
	private readonly room: Room;

	// TODO : Add handlers

	// eslint-disable-next-line
	private readonly handlers: Map<keyof Events, Handler<any>> = new Map<keyof Events, Handler<any>>();

	private isStarted = false;

	protected constructor(room: Room, type: GameTypes) {
		this.room = room;
		this.type = type;
	}

	public getType() {
		return this.type;
	}

	public getRoom() {
		return this.room;
	}

	// TODO : Add handlers
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