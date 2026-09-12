import { GamePlayer, GameStatus, GameTypes } from "../struct/game";
import { RoomTypings } from "../struct/room";

interface CoreMessageTypings {
	// Serverbound
	pong: void;
	roomData: RoomTypings;
	playerJoined: GamePlayer, // When a player joins the game
	playerRejoined: string, // When a player rejoins the game after a disconnection
	playerDisconnected: string, // When a player is disconnected from the game
	playerLeft: string, // When a player clicks on the 'Leave game' button
	playerKicked: string // When a player is kicked from the game
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
	statusSync: GameStatus;
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
	stateSync: any;
}

type CoreMessageType = keyof CoreMessageTypings;

export type { CoreMessageTypings, CoreMessageType };