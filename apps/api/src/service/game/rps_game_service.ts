import AbstractGameService from "../abstract_game_service";
import { AbstractGame, RpsMessageTypings, WebSocketClient } from "@repo/shared";

export default class RockPaperScissorsGameService extends AbstractGameService<RpsMessageTypings> {

	startGame(game: AbstractGame<RpsMessageTypings>): void {
		throw new Error("Method not implemented.");
	}

	registerClient(game: AbstractGame<RpsMessageTypings>, ws: WebSocketClient): void {
		throw new Error("Method not implemented.");
	}

	endGame(game: AbstractGame<RpsMessageTypings>): void {
		throw new Error("Method not implemented.");
	}
}