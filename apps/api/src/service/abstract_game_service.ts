import { AbstractGame, CoreMessageTypings, WebSocketClient } from "@repo/shared";

export default abstract class AbstractGameService<G extends AbstractGame<E>, E extends CoreMessageTypings> {

	public startGame(game: G): void {
		// game.startGame();

		this.broadcast(game, "gameStarted");
	}

	abstract registerClient(game: G, ws: WebSocketClient): void;

	public endGame(game: G): void {
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