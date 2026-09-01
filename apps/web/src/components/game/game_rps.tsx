import { AbstractGame, EventObject } from "./abstract_game";
import { RpsMessageTypings, RpsPossibilites } from "@repo/shared";
import { JSX } from "react";

const POSSIBILITY_TO_EMOJI = {
	"rock": "🪨",
	"paper": "📃",
	"scissors": "✂️",
};

interface RpsState {
	playable: boolean,
	result: { winner: string | undefined, picks: Map<string, RpsPossibilites> } | undefined,
	score: Map<string, number>,
	pick: RpsPossibilites | undefined
}

export class RockPaperScissorsGame extends AbstractGame<RpsMessageTypings, RpsState> {

	constructor(props: any) {
		super(props);
	}

	public renderPlaying(): JSX.Element {
		if (this.state.playable) {
			return <div className={"game-container gradient-reverse"}>
				<h2>Pick your object:</h2>
				<div className={"flex gap-16 mt-4"}>
					<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
						onClick={() => this.pick("rock")}>🪨<span className={"text-8xl"}> </span> {/* TODO : Send pick */}
					</div>
					<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
						onClick={() => this.pick("paper")}>📃
					</div>
					<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
						onClick={() => this.pick("scissors")}>✂️
					</div>
				</div>
			</div>;
		}

		if (this.state.result) {
			const players = [...this.websocket.getRoom()?.players.values() ?? []];

			return <div className={"game-container gradient-reverse"}>
				{this.state.result.winner ? <h3>{this.websocket.getRoom()?.players.get(this.state.result.winner)?.name} wins the round</h3> : <h3>Draw!</h3>}
				<div className={"flex gap-32 mt-4"}>
					<div className={"flex flex-col items-center"}>
						<div className={"text-7xl"}>{POSSIBILITY_TO_EMOJI[this.state.result.picks.get(players[0].id) ?? "paper"]}</div>
						<p>{players[0].name}</p>
					</div>
					<div className={"flex flex-col items-center"}>
						<div className={"text-7xl"}>{POSSIBILITY_TO_EMOJI[this.state.result.picks.get(players[1].id) ?? "paper"]}</div>
						<p>{players[1].name}</p>
					</div>
				</div>
			</div>;
		}

		return <div className={"game-container gradient-reverse"}>
			<p>Loading...</p>
		</div>;
	}

	private pick(choice: RpsPossibilites) {
		this.setState({
			pick: choice,
		});

		this.sendGame("select", choice);
	}

	protected handleData(event: EventObject<RpsMessageTypings>) {
		if (event.type === "playable") {
			this.setState({
				playable: event.data,
				pick: undefined,
			});
		} else if (event.type === "setScore") {
			this.setState({
				score: event.data,
			});
		} else if (event.type === "result") {
			this.setState({
				result: event.data,
			});
		}
	}

	protected getDefaultState() {
		return {
			playable: true,
			result: undefined,
			score: new Map(),
			pick: undefined,
		};
	}
}