import AbstractGameService from "../abstract_game_service";
import { CoreMessageTypings } from "@repo/shared";
import { DefaultGame } from "../../struct/game/abstract_game";

export default class DefaultGameService extends AbstractGameService<DefaultGame, CoreMessageTypings> {

	startGame(game: DefaultGame): void {
		super.startGame(game);

		setTimeout(() => this.endGame(game), 2000);
	}
}