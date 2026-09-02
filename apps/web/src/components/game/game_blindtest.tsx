import { AbstractGame, EventObject } from "./abstract_game";
import { BlindtestMessageTypings } from "@repo/shared";
import { JSX } from "react";

interface BlindtestState {
}

export class BlindtestGame extends AbstractGame<BlindtestMessageTypings, BlindtestState> {

	constructor(props: any) {
		super(props);
	}

	public renderPlaying(): JSX.Element {
		return <></>;
	}

	protected handleData(event: EventObject<BlindtestMessageTypings>) {
		// TODO
	}

	protected getDefaultState() {
		return {};
	}
}