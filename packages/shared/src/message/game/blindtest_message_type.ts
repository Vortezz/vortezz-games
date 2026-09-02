import { CoreMessageTypings } from "../core_message_type";

type Music = {
	title: string;
	author: string;
	cover: string;
	link: string;
}

interface BlindtestMessageTypings extends CoreMessageTypings {
	// Serverbound
	sendMusicPreview: string;
	setMusic: Music;

	// Clientbound
	guessMusic: string;
}

export type { BlindtestMessageTypings, Music };