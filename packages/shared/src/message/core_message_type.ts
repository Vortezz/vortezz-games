import { AbstractGame, GameTypes } from "../struct/abstract_game";

interface CoreMessageTypings {
	// Serverbound
	pong: void;
	gameData: AbstractGame<CoreMessageTypings>;
	gameStarted: void;

	// Clientbound
	ping: void;
	startGame: void;
	abortGame: void;
	setType: GameTypes;
}

type CoreMessageType = keyof CoreMessageTypings;

export type { CoreMessageTypings, CoreMessageType };