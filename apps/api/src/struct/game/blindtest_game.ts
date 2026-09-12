import { AbstractGame } from "./abstract_game";
import { Room } from "../room";
import { WebSocketClient } from "../websocket_client";
import { BlindtestMessageTypings, GamePlayer, GuessResult, Music } from "@repo/shared";
import blindtest from "../../../data/blindtest.json";

type BackendMusic = Music & {
	id: number
}

export class BlindtestGame extends AbstractGame<BlindtestMessageTypings> {

	private musics: BackendMusic[] = [];
	private currentMusicIndex = -1;
	private currentGoodGuesses: Map<string, GuessResult> = new Map();
	private points: Map<string, number> = new Map();
	private wantsToSkip: Map<string, boolean> = new Map();
	private endRoundTimer: NodeJS.Timeout | undefined;

	private currentPreview: string | undefined;

	public constructor(room: Room) {
		super(room, "blindtest");
	}

	public startGame() {
		super.startGame();

		this.musics = [...blindtest]
			.map(e => e as unknown)
			.map(e => e as BackendMusic)
			.sort(() => Math.random() - 0.5).slice(0, this.settings.rounds.value);

		for (let player of this.room.getPlayers()) {
			this.points.set(player.id, 0);
		}

		this.startNextSong();
	}

	public registerClient(ws: WebSocketClient) {
	}

	public getState(id: string) {
		return {
			musicPreview: this.currentPreview,
			currentMusic: this.currentPreview ? undefined : this.musics[this.currentMusicIndex],
			guessResult: this.currentGoodGuesses.get(id),
			currentSkips: this.wantsToSkip.size,
			hasSkipped: this.wantsToSkip.has(id),
		};
	}

	public handleGameEvent(wsClient: WebSocketClient, data: { type: string, data: any }) {
		if (this.room.players.get(wsClient.getId())!.owner) {
			if (data.type === "nextSong") {
				this.startNextSong();
			}
		}

		if (data.type === "guessMusic") {
			this.handleGuess(wsClient, data.data);
		}

		if (data.type === "askSkip") {
			this.wantsToSkip.set(wsClient.getId(), true);

			const skipCount = this.wantsToSkip.size;
			this.broadcast("skipCount", skipCount);

			if (skipCount >= this.getRoom().players.size) {
				this.endRound();
			}
		}
	}

	private handleGuess(wsClient: WebSocketClient, guess: string) {
		const result = this.currentGoodGuesses.get(wsClient.getId()) ?? {
			title: false,
			artist: false,
		};

		const artist = this.musics[this.currentMusicIndex].artist;
		const authorDist = this.distance(guess as string, artist);

		if (authorDist < artist.length * 0.2) {
			result.artist = true;
		}

		const title = this.musics[this.currentMusicIndex].title;
		const titleDist = this.distance(guess as string, title);

		if (titleDist < title.length * 0.2) {
			result.title = true;
		}

		this.currentGoodGuesses.set(wsClient.getId(), result);

		this.sendGame(wsClient, "setGuessResult", result);
	}

	private async startNextSong() {
		this.currentMusicIndex++;

		if (this.currentMusicIndex >= this.musics.length) {
			this.getRoom().broadcast("setResults", [...this.room.players.entries()].map(entry => {
				const id = entry[0];

				return {
					id: id,
					amount: this.points.get(id) ?? 0,
					format: "points" as "points",
				};
			}).sort((a, b) => b.amount - a.amount));

			this.getRoom().broadcast("gameEnded");
			return;
		}

		this.currentGoodGuesses = new Map();

		const music = this.musics[this.currentMusicIndex];

		const apiResponse = await fetch(`https://api.deezer.com/track/${music.id}`);

		if (!apiResponse.ok) {
			return;
		}

		const jsonApiResponse = await apiResponse.json();

		const preview = jsonApiResponse.preview;
		this.currentPreview = preview;

		this.broadcast("sendMusicPreview", preview);

		this.endRoundTimer = setTimeout(() => {
			this.endRound();
		}, 30000);
	}

	private endRound() {
		clearTimeout(this.endRoundTimer);

		this.currentPreview = undefined;

		const music = this.musics[this.currentMusicIndex];

		for (let player of this.room.getPlayers()) {
			const result = this.getResult(player);

			let points = 0;
			if (result.artist) {
				points++;
			}

			if (result.title) {
				points++;
			}

			this.points.set(player.id, this.points.get(player.id)! + points);

			this.broadcast("setMusicResult", { ...music, points });
		}
	}

	private getResult(player: GamePlayer) {
		return this.currentGoodGuesses.get(player.id) ?? {
			title: false,
			artist: false,
		};
	}

	// The following two functions comes from https://github.com/gustf/js-levenshtein
	private _min(d0: number, d1: number, d2: number, bx: number, ay: number) {
		return d0 < d1 || d2 < d1
			? d0 > d2
				? d2 + 1
				: d0 + 1
			: bx === ay
				? d1
				: d1 + 1;
	}

	private distance(a: string, b: string) {
		a = a.toLocaleLowerCase();
		b = b.toLocaleLowerCase();

		if (a === b) {
			return 0;
		}

		if (a.length > b.length) {
			const tmp = a;
			a = b;
			b = tmp;
		}

		let la = a.length;
		let lb = b.length;

		while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
			la--;
			lb--;
		}

		let offset = 0;

		while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
			offset++;
		}

		la -= offset;
		lb -= offset;

		if (la === 0 || lb < 3) {
			return lb;
		}

		let x: number = 0;
		let y: number;
		let d0: number;
		let d1: number;
		let d2: number;
		let d3: number;
		let dd: number = 0;
		let dy: number;
		let ay: number;
		let bx0: number;
		let bx1: number;
		let bx2: number;
		let bx3: number;

		const vector = [];

		for (y = 0; y < la; y++) {
			vector.push(y + 1);
			vector.push(a.charCodeAt(offset + y));
		}

		const len = vector.length - 1;

		for (; x < lb - 3;) {
			bx0 = b.charCodeAt(offset + (d0 = x));
			bx1 = b.charCodeAt(offset + (d1 = x + 1));
			bx2 = b.charCodeAt(offset + (d2 = x + 2));
			bx3 = b.charCodeAt(offset + (d3 = x + 3));
			dd = (x += 4);
			for (y = 0; y < len; y += 2) {
				dy = vector[y];
				ay = vector[y + 1];
				d0 = this._min(dy, d0, d1, bx0, ay);
				d1 = this._min(d0, d1, d2, bx1, ay);
				d2 = this._min(d1, d2, d3, bx2, ay);
				dd = this._min(d2, d3, dd, bx3, ay);
				vector[y] = dd;
				d3 = d2;
				d2 = d1;
				d1 = d0;
				d0 = dy;
			}
		}

		for (; x < lb;) {
			bx0 = b.charCodeAt(offset + (d0 = x));
			dd = ++x;
			for (y = 0; y < len; y += 2) {
				dy = vector[y];
				vector[y] = dd = this._min(dy, d0, dd, bx0, vector[y + 1]);
				d0 = dy;
			}
		}

		return dd;
	};
}