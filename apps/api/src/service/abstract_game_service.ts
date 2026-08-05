import { CoreMessageTypings } from "@repo/shared";
import { AbstractGame } from "../struct/game/abstract_game";
import { WebSocketClient } from "../struct/websocket_client";

export default abstract class AbstractGameService<G extends AbstractGame<E>, E extends CoreMessageTypings> {

	public startGame(game: G): void {
		game.getRoom().broadcast("gameStarted");

		setTimeout(() => {
			game.startGame();
		}, 100);
	}

	public registerClient(game: G, ws: WebSocketClient): void {
		game.registerClient(ws);
	}

	public endGame(game: G): void {
		game.getRoom().broadcast("gameEnded");

		setTimeout(() => {
			game.endGame();
		}, 100);
	}
}