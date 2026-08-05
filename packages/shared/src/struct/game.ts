import { RoomTypings } from "./room";
import { CoreMessageTypings } from "../message/core_message_type";
import { AbstractWebSocket } from "./abstract_websocket";

export interface GamePlayer {
	id: string;
	name: string;
	owner: boolean;
	ws: AbstractWebSocket | undefined;
}

export interface Events {
	playerAdded: GamePlayer;
}

export interface GameTypings<E extends CoreMessageTypings> {
	type: GameTypes;
	room: RoomTypings;
	settings: Record<string, {
		name: string;
		type: string;
		value: any;
	}>;
	results: {
		id: string;
		amount: number;
		format: "points" | "duration";
	}[] | undefined;
}

export interface AvailableGamesType {
	name: string;
	minPlayers: number;
	maxPlayers: number;
	settings: Record<string, {
		name: string;
		type: string;
		value: any;
	}>;
}

export const AvailableGames: Record<string, AvailableGamesType> = {
	"rps": {
		name: "Rock Paper Scissors",
		minPlayers: 2,
		maxPlayers: 2,
		settings: {
			pointsToWin: {
				value: 1,
				name: "Points to win",
				type: "number",
			},
		},
	},
	"default": {
		name: "Default",
		minPlayers: 1,
		maxPlayers: 64,
		settings: {},
	},
};

export type GameTypes = keyof typeof AvailableGames;