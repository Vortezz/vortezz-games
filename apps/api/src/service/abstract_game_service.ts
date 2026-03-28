import { AbstractGame, CoreMessageTypings, WebSocketClient } from "@repo/shared";

export default abstract class AbstractGameService<E extends CoreMessageTypings> {

	public startGame(game: AbstractGame<E>): void {
		// game.startGame();

		this.broadcast(game, "gameStarted");
	}

	abstract registerClient(game: AbstractGame<E>, ws: WebSocketClient): void;

	public endGame(game: AbstractGame<E>): void {
		// game.endGame();

		this.broadcast(game, "gameEnded");
	}

	public broadcast<K extends keyof E>(game: AbstractGame<CoreMessageTypings>, key: K, data?: E[K]): void {
		for (const player of game.getRoom().getPlayers()) {
			if (player.ws) {
				player.ws.send(key, data);
			}
		}
	}
}