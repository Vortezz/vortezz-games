import AbstractGameService from "../abstract_game_service";
import { AbstractGame, CoreMessageTypings, RpsMessageTypings, WebSocketClient } from "@repo/shared";

export default class RockPaperScissorsGameService extends AbstractGameService<CoreMessageTypings> {

	startGame(game: AbstractGame<RpsMessageTypings>): void {
		super.startGame(game);
	}

	registerClient(game: AbstractGame<RpsMessageTypings>, ws: WebSocketClient): void {
		// Nothing
	}

	endGame(game: AbstractGame<RpsMessageTypings>): void {
		super.endGame(game);
	}
}