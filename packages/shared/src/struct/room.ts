import { WebSocketClient } from "./websocket_client";
import { AbstractGame, DefaultGame, GamePlayer } from "./game/abstract_game";
import { CoreMessageTypings } from "../message/core_message_type";
import { generateString } from "../util/random_util";

type Handler<E extends keyof RoomEvents> = (data: RoomEvents[E]) => void;

export interface RoomEvents {
	chatMessage: undefined; // TODO
}

export class Room {

	private readonly id: string;
	private readonly name: string;
	private readonly password: string | null;

	private readonly players: Map<string, GamePlayer> = new Map<string, GamePlayer>();

	// eslint-disable-next-line
	private readonly handlers: Map<keyof RoomEvents, Handler<any>> = new Map<keyof RoomEvents, Handler<any>>();

	private game: AbstractGame<CoreMessageTypings> = new DefaultGame(this);

	public constructor(id: string, name: string, password: string | null) {
		this.id = id;
		this.name = name;
		this.password = password;
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
			realId = generateString(10);
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

	public getGame() {
		return this.game;
	}

	public getId(): string {
		return this.id;
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