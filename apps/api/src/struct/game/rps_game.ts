import { AbstractGame } from "./abstract_game";
import { Room } from "../room";
import { RpsMessageTypings, RpsPossibilites } from "@repo/shared";
import { WebSocketClient } from "../websocket_client";

export class RockPaperScissorsGame extends AbstractGame<RpsMessageTypings> {

	private picks: Map<string, RpsPossibilites> = new Map<string, RpsPossibilites>();
	private scores: Map<string, number> = new Map<string, number>();
	private playable: boolean = false;

	public constructor(room: Room) {
		super(room, "rps");
	}

	public play(player: string, pick: RpsPossibilites) {
		console.log("Played");
		if (!this.playable) {
			return;
		}

		this.picks.set(player, pick);

		if (this.picks.size !== 2) {
			return;
		}

		this.playable = false;
		this.broadcast("playable", false);

		const playerA = this.getRoom().getPlayers()[0].id;
		const playerB = this.getRoom().getPlayers()[1].id;

		const pickA = this.picks.get(playerA);
		const pickB = this.picks.get(playerB);

		if (!pickA || !pickB) {
			return; // Not possible
		}

		let winner;
		if (pickA === pickB) {
			// No points
		} else if (pickA === "paper" && pickB === "rock"
			|| pickA === "scissors" && pickB === "paper"
			|| pickA === "rock" && pickB === "scissors") {
			this.scores.set(playerA, (this.scores.get(playerA) ?? 0) + 1);
			winner = playerA;
		} else {
			this.scores.set(playerB, (this.scores.get(playerB) ?? 0) + 1);
			winner = playerB;
		}

		const scoreA = this.scores.get(playerA) ?? 0;
		const scoreB = this.scores.get(playerB) ?? 0;

		this.broadcast("setScore", this.scores);
		this.broadcast("result", { winner: winner, picks: new Map(this.picks) });

		this.picks.clear();

		setTimeout(() => {
			if (Math.max(scoreA, scoreB) >= this.settings.pointsToWin.value) {
				this.getRoom().broadcast("setResults", [...this.room.players.entries()].map(entry => {
					const id = entry[0];

					return {
						id: id,
						amount: this.scores.get(id) ?? 0,
						format: "points" as "points",
					};
				}).sort((a, b) => b.amount - a.amount));

				this.getRoom().broadcast("gameEnded");
			} else {
				this.playable = true;
				this.broadcast("playable", true);
			}
		}, 5000);
	}

	public startGame() {
		this.playable = true;
		this.broadcast("playable", true);
	}

	public setupPlayer(ws: WebSocketClient) {
		this.scores.set(ws.getId(), 0);
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		if (data.type === "select") {
			this.play(wsClient.getId(), data.data);
		}
	}
}