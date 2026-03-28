import { CoreMessageTypings, GameTypes, Room, WebSocketClient } from "@repo/shared";
import RockPaperScissorsGameService from "./game/rps_game_service";
import AbstractGameService from "./abstract_game_service";
import DefaultGameService from "./game/default_game_service";

export default class RoomsService {

	public static INSTANCE: RoomsService = new RoomsService();

	private availableGameServices = new Map<GameTypes, AbstractGameService<CoreMessageTypings>>();
	private currentRooms = new Map<string, Room>();

	public initialize() {
		this.availableGameServices.set("rps", new RockPaperScissorsGameService());
		this.availableGameServices.set("default", new DefaultGameService());
	}

	public getRoom(id: string): Room | undefined {
		return this.currentRooms.get(id);
	}

	public createRoom(name: string, password: string | null): Room {
		const id = "ekalia"; // TODO : Generate it

		const room = new Room(id, name, password);

		this.currentRooms.set(id, room);

		return room;
	}

	public registerPlayer(room: Room, wsClient: WebSocketClient, name: string) {
		const playerId = name; // TODO : Generate him

		// TODO : Prevent from using a name already used

		const isOwner = room.registerPlayer(name, wsClient, playerId, undefined);

		wsClient.send("roomData", room);

		if (isOwner) {
			wsClient.on("startGame", () => this.startGame(room));

			wsClient.on("setType", () => {
				// TODO
			});
		}
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