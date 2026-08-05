import { AbstractGame, DefaultGame } from "../struct/game/abstract_game";
import { Room } from "../struct/room";
import { RockPaperScissorsGame } from "../struct/game/rps_game";
import { CoreMessageTypings, GameTypes } from "@repo/shared";

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