import { CoreMessageTypings, GameTypes } from "@repo/shared";
import RockPaperScissorsGameService from "./game/rps_game_service";
import AbstractGameService from "./abstract_game_service";
import DefaultGameService from "./game/default_game_service";
import { AbstractGame, DefaultGame } from "../struct/game/abstract_game";
import { Room } from "../struct/room";
import { generateString } from "../util/random_util";
import { WebSocketClient } from "../struct/websocket_client";
import { RockPaperScissorsGame } from "../struct/game/rps_game";

function createGame(type: GameTypes, room: Room) {
	switch (type) {
		case "default":
			room.game = new DefaultGame(room);
			break;
		case "rps":
			room.game = new RockPaperScissorsGame(room);
			break;
	}
}

export default class RoomsService {

	public static INSTANCE: RoomsService = new RoomsService();

	private availableGameServices = new Map<GameTypes, AbstractGameService<AbstractGame<CoreMessageTypings>, CoreMessageTypings>>();
	private currentRooms = new Map<string, Room>();

	public initialize() {
		this.availableGameServices.set("rps", new RockPaperScissorsGameService());
		this.availableGameServices.set("default", new DefaultGameService());
	}

	public getRoom(id: string): Room | undefined {
		return this.currentRooms.get(id);
	}

	public createRoom(name: string, password: string | null): Room {
		const id = generateString(4); // TODO : Generate it

		const room = new Room(id, name, password);

		this.currentRooms.set(id, room);

		return room;
	}

	public registerPlayer(room: Room, wsClient: WebSocketClient, name: string, id: string) {
		// TODO : Prevent from using a name already used

		const otherPlayers = room.getPlayers();

		const isOwner = room.registerPlayer(name, wsClient, id, undefined);

		wsClient.send("self", id);
		wsClient.send("roomData", room);

		if (isOwner) {
			wsClient.on("startGame", () => this.startGame(room));

			wsClient.on("setType", (type) => {
				createGame(type, room);

				room.broadcast("roomData", room);
			});

			wsClient.on("setSettings", settings => {
				room.game.settings = settings; // TODO : Check if valid

				room.broadcast("settingsUpdated", settings);
			});

			wsClient.on("resetGame", () => {
				const settings = room.game.settings;

				createGame(room.game.type, room);

				room.game.settings = settings;

				room.broadcast("roomData", room);
			});
		}

		wsClient.on("ping", () => wsClient.send("pong"));
		wsClient.on("gameEvent", (data) => room.handleGameEvent(wsClient, data));

		otherPlayers.forEach(player => player.ws?.send("playerJoined", room.getPlayers().pop()));

		console.log("Registered");
	}

	private startGame(room: Room) {
		const game = room.getGame();

		if (game === undefined) {
			// TODO : Send error
			return;
		}

		const gameService = this.availableGameServices.get(game.getType());

		console.log("Starting game", game);
		if (gameService === undefined) {
			// TODO : Send error
			return;
		}

		gameService.startGame(game);
	}
}