import { CoreMessageTypings } from "../../message/core_message_type";
import { AbstractGame, DefaultGame, GameTypes } from "../abstract_game";
import RockPaperScissorsGame from "./rps_game";
import { Room } from "../room";

export function createGameType(room: Room, type: GameTypes): AbstractGame<CoreMessageTypings> {
	let game;
	switch (type) {
		case "default":
			game = new DefaultGame(room);
			break;
		case "rps":
			game = new RockPaperScissorsGame(room);
			break;
	}

	return game;
}