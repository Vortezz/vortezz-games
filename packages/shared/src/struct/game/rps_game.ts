import { AbstractGame } from "./abstract_game";
import { RpsMessageTypings } from "../../message/game/rps_message_type";
import { Room } from "../room";

export class RockPaperScissorsGame extends AbstractGame<RpsMessageTypings> {

	public constructor(room: Room) {
		super(room, "rps");
	}
}