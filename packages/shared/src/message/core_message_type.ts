import { GamePlayer, GameTypes } from "../struct/game";
import { RoomTypings } from "../struct/room";

interface CoreMessageTypings {
	// Serverbound
	pong: void;
	roomData: RoomTypings;
	playerJoined: GamePlayer,
	playerLeft: string,
	playerKicked: string
	newOwner: string;
	gameStarted: void;
	gameEnded: void;
	settingUpdated: {
		name: string;
		value: any;
	};
	setResults: {
		id: string;
		amount: number;
		format: "points" | "duration";
	}[];
	self: string;
	error: string;
	needsPassword: string;

	// Clientbound
	ping: void;
	startGame: void;
	abortGame: void;
	setType: GameTypes;
	setSetting: {
		name: string;
		value: any;
	};
	resetGame: void;
	kickPlayer: string;
	leaveGame: void;

	// Both
	gameEvent: {
		type: string;
		// eslint-disable-next-line
		data: any;
	};
}

type CoreMessageType = keyof CoreMessageTypings;

export type { CoreMessageTypings, CoreMessageType };