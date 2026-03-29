import AbstractGameService from "../abstract_game_service";
import { RockPaperScissorsGame, AbstractGame, RpsMessageTypings, WebSocketClient } from "@repo/shared";

export default class RockPaperScissorsGameService extends AbstractGameService<RockPaperScissorsGame, RpsMessageTypings> {

	startGame(game: RockPaperScissorsGame): void {
		throw new Error("Method not implemented.");
	}

	registerClient(game: RockPaperScissorsGame, ws: WebSocketClient): void {
		throw new Error("Method not implemented.");
	}

	endGame(game: RockPaperScissorsGame): void {
		throw new Error("Method not implemented.");
	}
}