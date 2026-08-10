import { CoreMessageTypings } from "../core_message_type";

interface WikiRaceMessageTypings extends CoreMessageTypings {
	// Serverbound
	changedPage: { id: string, page: string };
	currentPaths: { id: string, pages: string[] }[];

	// Clientbound
	changePage: string;
}

export type { WikiRaceMessageTypings };