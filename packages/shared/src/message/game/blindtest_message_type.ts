import { CoreMessageTypings } from "../core_message_type";

type Music = {
	title: string;
	artist: string;
	picture: string;
	link: string;
}

type MusicResult = Music & {
	points: number
}

type GuessResult = {
	artist: boolean,
	title: boolean,
}

interface BlindtestMessageTypings extends CoreMessageTypings {
	// Serverbound
	sendMusicPreview: string;
	setMusicResult: MusicResult;
	setGuessResult: GuessResult;
	skipCount: number;

	// Clientbound
	guessMusic: string;
	nextSong: void;
	askSkip: void;
}

export type { BlindtestMessageTypings, Music, MusicResult, GuessResult };