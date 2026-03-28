import { WebSocketClient } from "./websocket_client";
import { CoreMessageTypings } from "../message/core_message_type";
import { createGameType } from "./game/game_utils";

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

	private readonly id: string;
	private readonly name: string;
	private readonly password: string | null;
	private readonly type: GameTypes;

	private readonly players: Map<string, GamePlayer> = new Map<string, GamePlayer>();

	// eslint-disable-next-line
	private readonly handlers: Map<keyof Events, Handler<any>> = new Map<keyof Events, Handler<any>>();

	private isStarted = false;

	protected constructor(id: string, name: string, password: string | null, type: GameTypes) {
		this.id = id;
		this.name = name;
		this.password = password;
		this.type = type;
	}

	/**
	 * This method is used to check whether a room password is the right one
	 *
	 * @param password The password to check
	 */
	public checkPassword(password: string | null) {
		return this.password === password;
	}

	public registerPlayer(name: string, ws: WebSocketClient | undefined, id: string | undefined, owner: boolean | undefined): boolean {
		let realId = id;
		if (realId === undefined) {
			realId = ""; // TODO : Generate it
		}

		let realOwner = owner;
		if (realOwner === undefined) {
			realOwner = this.players.size === 0;
		}

		this.players.set(realId, {
			id: realId,
			name: name,
			owner: realOwner,
			ws: ws,
		});

		return realOwner;
	}

	public startGame() {
		this.isStarted = true;
	}

	public getId(): string {
		return this.id;
	}

	public getType() {
		return this.type;
	}

	public getName() {
		return this.name;
	}

	public getPassword() {
		return this.password;
	}

	public getPlayers() {
		return [...this.players.values()];
	}

	// TODO : Add handlers
}

export class DefaultGame extends AbstractGame<CoreMessageTypings> {

	public constructor(id: string, name: string, password: string | null) {
		super(id, name, password, "default");
	}
}

export interface GameEvent {
	event: string;
	data: never;
}