import { GamePlayer, GameTypings } from "./game";

export interface RoomEvents {
	chatMessage: undefined; // TODO
}

export interface RoomTypings {
	id: string;
	name: string;
	password: string | null;
	players: Map<string, GamePlayer>;
	game: GameTypings;
}