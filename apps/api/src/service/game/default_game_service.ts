import AbstractGameService from "../abstract_game_service";
import { CoreMessageTypings, DefaultGame, WebSocketClient } from "@repo/shared";

export default class DefaultGameService extends AbstractGameService<DefaultGame, CoreMessageTypings> {

	startGame(game: DefaultGame): void {
		super.startGame(game);

		setTimeout(() => this.endGame(game), 2000);
	}

	registerClient(game: DefaultGame, ws: WebSocketClient): void {
		// Nothing
	}

	endGame(game: DefaultGame): void {
		super.endGame(game);
	}
}