import { GamePlayer, GameTypes } from "../struct/game";
import { RoomTypings } from "../struct/room";

interface CoreMessageTypings {
	// Serverbound
	pong: void;
	roomData: RoomTypings;
	playerJoined: GamePlayer,
	playerLeft: GamePlayer,
	gameStarted: void;
	gameEnded: void;
	settingsUpdated: Record<string, {
		name: string;
		type: string;
		value: any;
	}>;
	setResults: {
		id: string;
		amount: number;
		format: "points" | "duration";
	}[];
	self: string;
	error: string;

	// Clientbound
	ping: void;
	startGame: void;
	abortGame: void;
	setType: GameTypes;
	setSettings: Record<string, {
		name: string;
		type: string;
		value: any;
	}>;
	resetGame: void;

	// Both
	gameEvent: {
		type: string;
		// eslint-disable-next-line
		data: any;
	};
}

type CoreMessageType = keyof CoreMessageTypings;

export type { CoreMessageTypings, CoreMessageType };