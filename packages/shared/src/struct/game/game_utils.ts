import { CoreMessageTypings } from "../../message/core_message_type";
import { AbstractGame, DefaultGame, GameTypes } from "../abstract_game";
import RockPaperScissorsGame from "./rps_game";


export function createGameType(name: string, password: string | null, type: GameTypes, id?: string): AbstractGame<CoreMessageTypings> {
	const realId = id ? id : "ekalia"; // TODO

	let game;
	switch (type) {
		case "default":
			game = new DefaultGame(realId, name, password);
			break;
		case "rps":
			game = new RockPaperScissorsGame(realId, name, password);
			break;
	}

	return game;
}


export function migrateToType(type: GameTypes, game: AbstractGame<CoreMessageTypings>) {
	const newGame = createGameType(game.getName(), game.getPassword(), type, game.getId());

	for (const player of game.getPlayers()) {
		newGame.registerPlayer(player.name, player.ws, player.id, player.owner);
	}

	return newGame;
}