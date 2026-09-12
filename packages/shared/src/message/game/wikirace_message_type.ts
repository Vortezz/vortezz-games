import { CoreMessageTypings } from "../core_message_type";

interface WikiRaceMessageTypings extends CoreMessageTypings {
	// Serverbound
	changedPage: { id: string, page: string };
	gameFinished: { id: string, finishedAt: number };
	currentPaths: { id: string, pages: string[] }[];
	surrenderCount: number;

	// Clientbound
	changePage: string;
	wantsToSurrender: void;
}

export type { WikiRaceMessageTypings };