import { AbstractGame, EventObject } from "./abstract_game";
import { BlindtestMessageTypings, GuessResult, MusicResult } from "@repo/shared";
import { JSX } from "react";
import error from "../../resources/icons/error.svg";
import success from "../../resources/icons/success.svg";
import { VolumeInput } from "./parts/volume_button";

interface BlindtestState {
	musicPreview: string | undefined;
	currentMusic: MusicResult | undefined;
	currentGuess: string | undefined;
	guessResult: GuessResult | undefined;
	volume: number;
	currentSkips: number;
	hasSkipped: boolean;
}

export class BlindtestGame extends AbstractGame<BlindtestMessageTypings, BlindtestState> {

	constructor(props: any) {
		super(props);
	}

	public componentDidUpdate(_prevProps: Readonly<any>, _prevState: Readonly<BlindtestState>, _snapshot?: any) {
		const player = document.getElementById("player");

		if (player === null || !(player instanceof HTMLAudioElement)) {
			return;
		}

		player.volume = this.state.volume / 100;
	}

	public renderPlaying(): JSX.Element {
		console.log(this.state);

		if (this.state.currentMusic !== undefined) {
			return <div className={"game-container gradient-reverse"}>
				<h2>You got {this.state.currentMusic.points} point{this.state.currentMusic.points > 1 ? "s" : ""}!</h2>
				<div className={"flex items-center justify-center gap-8 mt-8 overflow-x-auto flex-wrap"}>
					<img className={"h-32 w-32 rounded-md"}
						src={this.state.currentMusic.picture}
						alt={"Album cover"} />
					<div className={"flex flex-col my-auto"}>
						<span className={"font-bold text-2xl text-white"}>{this.state.currentMusic.title}</span>
						<span className={"text-xl text-white"}>{this.state.currentMusic.artist}</span>
					</div>
				</div>
				{this.websocket.isRoomOwner() && <button
					onClick={() => {
						this.sendGame("nextSong");
					}}
					className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Next song
				</button>}
			</div>;
		}

		if (this.state.musicPreview !== undefined) {
			const artistGuessed = this.state.guessResult && this.state.guessResult.artist;
			const titleGuessed = this.state.guessResult && this.state.guessResult.title;

			return <div className={"game-container gradient-reverse"}>
				<h2>Time to guess 🎶</h2>
				<div>
					<div className={"flex align-center gap-4"}>
						<img className={"h-8"}
							src={artistGuessed ? success : error}
							alt={"Statut"} />
						<span className={`${artistGuessed ? "text-[#4bb543]" : "text-[#ff0033]"} my-auto`}>Artist</span>
					</div>
					<div className={"flex align-center gap-4 mt-2"}>
						<img className={"h-8"}
							src={titleGuessed ? success : error}
							alt={"Statut"} />
						<span className={`${titleGuessed ? "text-[#4bb543]" : "text-[#ff0033]"} my-auto`}>Title</span>
					</div>
				</div>
				<audio src={this.state.musicPreview}
					id={"player"}
					autoPlay={true} />
				<div className={"flex items-center justify-center gap-4 mt-8 flex-wrap"}>
					<button disabled={this.state.hasSkipped}
						className={"bg-lime-300 rounded-md py-2 px-4 mx-auto cursor-pointer disabled:bg-[#999999] disabled:cursor-default"}
						onClick={() => {
							this.sendGame("askSkip");

							this.setState({
								hasSkipped: true,
							});
						}}>SKIP ({this.state.currentSkips}/{this.getRoom().players.size})
					</button>
					<form
						onSubmit={e => {
							e.preventDefault();

							const guess = this.state.currentGuess;

							this.sendGame("guessMusic", guess ?? "");
						}}>
						<input
							value={this.state.currentGuess}
							onChange={(e) => {
								this.setState({
									currentGuess: e.target.value,
								});

								e.target.value = "";
							}}
							autoComplete={"off"}
							id={"guess"} />
					</form>
					<VolumeInput volume={this.state.volume}
						setVolume={(volume) => {
							this.setState({
								volume: volume,
							});

							localStorage.setItem("blindtest.volume", volume.toString());
						}} />
				</div>
			</div>;
		}

		return <div className={"game-container gradient-reverse"}>
			<p>Loading...</p>
		</div>;
	}

	protected handleData(event: EventObject<BlindtestMessageTypings>) {
		super.handleData(event);

		if (event.type === "sendMusicPreview") {
			this.setState({
				musicPreview: event.data,
				currentMusic: undefined,
				currentGuess: undefined,
				guessResult: undefined,
				currentSkips: 0,
				hasSkipped: false,
			});
		} else if (event.type === "setMusicResult") {
			this.setState({
				musicPreview: undefined,
				guessResult: undefined,
				currentMusic: event.data,
				currentGuess: undefined,
			});
		} else if (event.type === "setGuessResult") {
			const guessInput = document.getElementById("guess");

			if (!guessInput || !(guessInput instanceof HTMLInputElement)) {
				return;
			}

			guessInput.value = "";

			const addition = this.state.guessResult === undefined && (event.data.title || event.data.artist)
				|| this.state.guessResult !== undefined && (event.data.artist !== this.state.guessResult!.artist || event.data.title !== this.state.guessResult!.title);

			if (!addition) {
				guessInput.classList.add("horizontal-shaking-animation");

				setTimeout(() => {
					guessInput.classList.remove("horizontal-shaking-animation");
				}, 550);
			}

			this.setState({
				guessResult: event.data,
				currentGuess: "",
			});
		} else if (event.type === "skipCount") {
			this.setState({
				currentSkips: event.data,
			});
		}
	}

	protected getDefaultState() {
		return {
			musicPreview: undefined,
			currentMusic: undefined,
			currentGuess: undefined,
			guessResult: undefined,
			volume: parseInt(localStorage.getItem("blindtest.volume") ?? "100"),
			currentSkips: 0,
			hasSkipped: false,
		};
	}
}