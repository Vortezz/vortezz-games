import { AbstractGame } from "../abstract_game";
import { RpsMessageTypings } from "../../message/game/rps_message_type";

export default class RockPaperScissorsGame extends AbstractGame<RpsMessageTypings> {

	public constructor(id: string, name: string, password: string | null) {
		super(id, name, password, "rps");
	}
}