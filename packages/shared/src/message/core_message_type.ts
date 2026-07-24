import { GamePlayer, GameTypes } from "../struct/game/abstract_game";
import { Room } from "../struct/room";

interface CoreMessageTypings {
	// Serverbound
	pong: void;
	roomData: Room;
	playerJoined: GamePlayer,
	playerLeft: GamePlayer,
	gameStarted: void;
	gameEnded: void;

	// Clientbound
	ping: void;
	startGame: void;
	abortGame: void;
	setType: GameTypes;

	// Both
	// eslint-disable-next-line
	gameEvent: any;
}

type CoreMessageType = keyof CoreMessageTypings;

export type { CoreMessageTypings, CoreMessageType };