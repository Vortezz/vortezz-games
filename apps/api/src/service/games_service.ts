import { AbstractGame, CoreMessageTypings, createGameType, GameTypes, WebSocketClient } from "@repo/shared";
import RockPaperScissorsGameService from "./game/rps_game_service";
import AbstractGameService from "./abstract_game_service";

export default class GamesService {

	public static INSTANCE: GamesService = new GamesService();

	private availableGameServices = new Map<GameTypes, AbstractGameService<CoreMessageTypings>>();
	private currentGames = new Map<string, AbstractGame<CoreMessageTypings>>();

	public initialize() {
		this.availableGameServices.set("rps", new RockPaperScissorsGameService());
	}

	public getGame(id: string): AbstractGame<CoreMessageTypings> | undefined {
		return this.currentGames.get(id);
	}

	public createGame(name: string, password: string | null) {
		const game = createGameType(name, password, "default");

		this.currentGames.set(game.getId(), game);

		return game;
	}

	public registerPlayer(game: AbstractGame<CoreMessageTypings>, wsClient: WebSocketClient, name: string) {
		const playerId = name; // TODO : Generate him

		// TODO : Prevent from copying a name already used

		const isOwner = game.registerPlayer(name, wsClient, playerId, undefined);

		wsClient.send("gameData", game);

		if (isOwner) {
			wsClient.on("startGame", () => this.startGame(game));

			wsClient.on("setType", () => {
				// TODO
			});
		}
	}

	private startGame(game: AbstractGame<CoreMessageTypings>) {
		const gameService = this.availableGameServices.get(game.getType());

		console.log("Starting game", game);
		if (!gameService) {
			// TODO : Send error
			return;
		}

		gameService.startGame(game);
	}
}