import { CoreMessageTypings } from "../core_message_type";

interface RpsMessageTypings extends CoreMessageTypings {
	// Serverbound

	// Clientbound
	select: "rock" | "paper" | "scissors";
}

type RpsMessageType = keyof RpsMessageTypings;

export type { RpsMessageTypings, RpsMessageType };