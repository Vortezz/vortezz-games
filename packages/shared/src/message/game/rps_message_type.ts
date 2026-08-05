import { CoreMessageTypings } from "../core_message_type";

interface RpsMessageTypings extends CoreMessageTypings {
	// Serverbound
	setScore: Map<string, number>;
	result: { winner: string | undefined, picks: Map<string, RpsPossibilites> }; // id of the winning player or none if draw
	playable: boolean;

	// Clientbound
	select: RpsPossibilites;
}

export type RpsPossibilites = "rock" | "paper" | "scissors";

type RpsMessageType = keyof RpsMessageTypings;

export type { RpsMessageTypings, RpsMessageType };