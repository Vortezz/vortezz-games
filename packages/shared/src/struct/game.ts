import { RoomTypings } from "./room";
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

export type SettingType = "number" | "wikilanguage" | "wikipage" | "boolean" | "choice";

export type Setting = {
	name: string;
	type: SettingType;
	value: any;
	data?: {
		id: string;
		name: string;
	}[];
};

export type Settings = Record<string, Setting>;

export interface GameTypings {
	type: GameTypes;
	room: RoomTypings;
	settings: Settings;
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
	settings: Settings;
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
	"wikirace": {
		name: "WikiRace",
		minPlayers: 1,
		maxPlayers: 64,
		settings: {
			language: {
				value: "en",
				name: "Language",
				type: "wikilanguage",
			},
			startPage: {
				value: "",
				name: "Start page",
				type: "wikipage",
			},
			endPage: {
				value: "",
				name: "End page",
				type: "wikipage",
			},
			allowFind: {
				value: false,
				name: "Allow find",
				type: "boolean",
			},
			ranking: {
				value: "fastest",
				name: "Ranking",
				type: "choice",
				data: [
					{
						name: "Fastest",
						id: "fastest",
					},
					{
						name: "Lowest clics",
						id: "lowestclics",
					},
				],
			},
		},
	},
};

export async function validateSetting(type: SettingType, value: any, name: string, otherSettings: Settings) {
	if (type === "number") {
		return typeof value === "number";
	} else if (type === "boolean") {
		return typeof value === "boolean";
	} else if (type === "wikilanguage") {
		return ["fr", "en"].indexOf(value) !== -1;
	} else if (type === "wikipage") {
		if (!otherSettings.language || value === "") {
			return false;
		}

		if (value === otherSettings[name].value) {
			return true;
		}

		// Server-side validation only
		const response = await fetch(`https://${otherSettings.language.value}.wikipedia.org/w/api.php?action=parse&prop=&page=${value}&format=json&redirects=true&origin=*`);

		if (!response.ok) {
			return false;
		}

		const json = await response.json();

		return !json.error;
	} else if (type === "choice") {
		return otherSettings[name].data!.filter(e => e.id === value).length > 0;
	}

	return false;
}

export type GameTypes = keyof typeof AvailableGames;