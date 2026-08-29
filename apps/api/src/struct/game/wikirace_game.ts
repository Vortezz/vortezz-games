import { AbstractGame } from "./abstract_game";
import { Room } from "../room";
import { WikiRaceMessageTypings } from "@repo/shared";
import { WebSocketClient } from "../websocket_client";

export class WikiRaceGame extends AbstractGame<WikiRaceMessageTypings> {

	private pathsTaken: Map<string, string[]> = new Map();
	private finishedAt: Map<string, number> = new Map();
	private startedAt: number = 0;

	public constructor(room: Room) {
		super(room, "wikirace");
	}

	public startGame() {
		super.startGame();

		this.startedAt = Date.now();

		this.getRoom().getPlayers().forEach(player => {
			this.pathsTaken.set(player.id, [this.settings.startPage.value]);
		});
	}

	public registerClient(ws: WebSocketClient) {
		this.pathsTaken.set(ws.getId(), []);
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		if (data.type === "changePage") {
			const id = wsClient.getId();

			if (this.finishedAt.has(id)) {
				return;
			}

			const page = data.data;
			this.pathsTaken.get(id)!.push(page);

			for (let finishedPlayer of this.finishedAt.keys()) {
				const player = this.getRoom().players.get(finishedPlayer);

				if (!player) {
					continue;
				}

				player.ws!.send("gameEvent", {
					type: "changedPage",
					data: {
						id: id,
						page: page,
					},
				});
			}

			if (this.settings.endPage.value === page) {
				const finishedAt = Date.now();
				this.finishedAt.set(id, finishedAt);

				wsClient.send("gameEvent", {
					type: "currentPaths",
					data: [...this.pathsTaken.entries()].map((item) => ({
						id: item[0],
						pages: item[1],
					})),
				});

				this.broadcast("gameFinished", {
					id: id,
					finishedAt: finishedAt,
				});
			}

			if (this.finishedAt.size === this.getRoom().players.size) {
				this.getRoom().broadcast("setResults", [...this.room.players.entries()].map(entry => {
					const id = entry[0];

					return {
						id: id,
						amount: this.finishedAt.has(id) ? this.finishedAt.get(id)! - this.startedAt : -1,
						format: "duration" as "duration",
					};
				}).sort((a, b) => a.amount - b.amount));

				this.getRoom().broadcast("gameEnded");
			}
		}
	}

	public handleSettingChange(name: string, value: any) {
		if (name === "language") {
			this.settings.startPage.value = "";

			this.getRoom().broadcast("settingUpdated", {
				name: "startPage",
				value: "",
			});

			this.settings.endPage.value = "";

			this.getRoom().broadcast("settingUpdated", {
				name: "endPage",
				value: "",
			});
		}
	}
}