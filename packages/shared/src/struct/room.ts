import { GamePlayer, GameTypings } from "./game";
import { CoreMessageTypings } from "../message/core_message_type";

export interface RoomEvents {
	chatMessage: undefined; // TODO
}

export interface RoomTypings {
	id: string;
	name: string;
	password: string | null;
	players: Map<string, GamePlayer>;
	game: GameTypings<CoreMessageTypings>;
}