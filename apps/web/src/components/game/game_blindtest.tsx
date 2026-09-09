import { AbstractGame, EventObject } from "./abstract_game";
import { BlindtestMessageTypings, GuessResult, MusicResult } from "@repo/shared";
import { JSX } from "react";
import error from "../../resources/icons/error.svg";
import success from "../../resources/icons/success.svg";

interface BlindtestState {
	musicPreview: string | undefined;
	currentMusic: MusicResult | undefined;
	currentGuess: string | undefined;
	guessResult: GuessResult | undefined;
}

export class BlindtestGame extends AbstractGame<BlindtestMessageTypings, BlindtestState> {

	constructor(props: any) {
		super(props);
	}

	public renderPlaying(): JSX.Element {
		if (this.state.currentMusic !== undefined) {
			return <div className={"game-container gradient-reverse"}>
				<h2>You got {this.state.currentMusic.points} point{this.state.currentMusic.points > 1 ? "s" : ""}!</h2>
				<div className={"flex align-center gap-8 mt-8"}>
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
					autoPlay={true} />
				<form
					onSubmit={e => {
						e.preventDefault();

						const guess = this.state.currentGuess;

						this.sendGame("guessMusic", guess ?? "");
					}}
					className={"flex align-center gap-8 mt-8"}>
					<input
						value={this.state.currentGuess}
						onChange={(e) => {
							this.setState({
								currentGuess: e.target.value,
							});

							e.target.value = "";
						}}
						id={"guess"} />
					<button
						type={"submit"}
						className={"bg-lime-300 rounded-md py-2 px-4 mx-auto cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Guess
					</button>
				</form>
			</div>;
		}

		return <div className={"game-container gradient-reverse"}>
			<p>Loading</p>
		</div>;
	}

	protected handleData(event: EventObject<BlindtestMessageTypings>) {
		if (event.type === "sendMusicPreview") {
			this.setState({
				musicPreview: event.data,
				currentMusic: undefined,
				currentGuess: undefined,
				guessResult: undefined,
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

			const unchanged = this.state.guessResult === undefined || (event.data.artist === this.state.guessResult!.artist && event.data.title === this.state.guessResult!.title) || (!event.data.title && !event.data.artist);

			if (unchanged) {
				guessInput.classList.add("horizontal-shaking-animation");

				setTimeout(() => {
					guessInput.classList.remove("horizontal-shaking-animation");
				}, 550);
			}

			this.setState({
				guessResult: event.data,
				currentGuess: "",
			});
		}
	}

	protected getDefaultState() {
		return {
			musicPreview: undefined,
			currentMusic: undefined,
			currentGuess: undefined,
			guessResult: undefined,
		};
	}
}