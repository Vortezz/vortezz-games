import { CoreMessageTypings, GamePlayer, generateString, RoomEvents, RoomTypings } from "@repo/shared";
import { AbstractGame } from "./game/abstract_game";
import { WebSocketClient } from "./websocket_client";
import { RockPaperScissorsGame } from "./game/rps_game";

type Handler<E extends keyof RoomEvents> = (data: RoomEvents[E]) => void;

export class Room implements RoomTypings {

	readonly id: string;
	readonly name: string;
	readonly password: string | null;

	readonly players: Map<string, GamePlayer> = new Map<string, GamePlayer>();

	// eslint-disable-next-line
	private readonly handlers: Map<keyof RoomEvents, Handler<any>> = new Map<keyof RoomEvents, Handler<any>>();

	game: AbstractGame<CoreMessageTypings> = new RockPaperScissorsGame(this); // TODO : Change this

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
		if (this.game.isGameStarted()) {
			if (ws) {
				ws.send("error", "Game already started");
				ws.close(3000);
			}

			return false;
		}

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

	public broadcast<E extends CoreMessageTypings, K extends keyof E>(key: K, data?: E[K]) {
		this.getPlayers().forEach(player => player.ws?.send(key, data));
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		if (this.game && this.game.isGameStarted()) {
			this.game.handleGameEvent(wsClient, data);
		}
	}
}