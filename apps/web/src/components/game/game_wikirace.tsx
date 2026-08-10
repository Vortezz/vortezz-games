import { AbstractGame, EventObject } from "./abstract_game";
import { JSX } from "react";
import { WikiRaceMessageTypings } from "@repo/shared/src/message/game/wikirace_message_type";
import { ResultWikiRace } from "./wikirace/result_wikirace";
import { TimerComponent } from "./parts/timer";

interface WikiRaceTypings {
	currentPage: string | undefined;
	currentPageContent: string | undefined;
	finished: boolean;
	finishedAt: Map<string, number>;
	paths: { id: string, pages: string[] }[];
}

export class WikiRaceGame extends AbstractGame<WikiRaceMessageTypings, WikiRaceTypings> {

	constructor(props: any) {
		super(props);
	}

	public renderPlaying(): JSX.Element {
		if (this.state.finished) {
			return <div className={"game-container gradient-reverse"}>
				<h3>Pending results...</h3>
				<ResultWikiRace paths={this.state.paths}
					startPage={this.getGame().settings.startPage.value}
					endPage={this.getGame().settings.endPage.value}
					players={this.getRoom().players}
					finishedAt={this.state.finishedAt}
					startedAt={this.websocket.getGameStartedAt()} />
			</div>;
		}

		return <div className={"game-container bg-white"}>
			<h3 className={"text-black flex"}>Get to {this.getGame().settings.endPage.value} -&nbsp;<TimerComponent startedAt={this.websocket.getGameStartedAt()} /></h3>
			<div className={"wiki-wrapper"}>
				<h1 className={"mw-heading"}>{this.state.currentPage}</h1>
				{this.state.currentPageContent ? <div className={"wiki-wrapper w-[calc(90%)]"}
					onClick={e => {
						e.preventDefault();

						if (!(e.target instanceof HTMLAnchorElement)) {
							return;
						}

						if (!e.target.href.includes(window.location.origin)) {
							return;
						}

						this.changePage(e.target.title);
					}}
					dangerouslySetInnerHTML={{ __html: this.state.currentPageContent }} /> : <p>Loading...</p>}
			</div>
		</div>;
	}

	protected renderResults(): JSX.Element {
		return <div className={"game-container gradient-reverse"}>
			<h3>Results</h3>
			<ResultWikiRace paths={this.state.paths}
				startPage={this.getGame().settings.startPage.value}
				endPage={this.getGame().settings.endPage.value}
				players={this.getRoom().players}
				finishedAt={this.state.finishedAt}
				startedAt={this.websocket.getGameStartedAt()} />
			{this.getLobbyButton()}
		</div>;
	}

	private changePage(title: string, skipWs?: boolean) {
		if (title === "" || title.startsWith("File:")) {
			return;
		}

		this.setState({
			currentPage: title,
			currentPageContent: undefined,
		});

		if (!skipWs) {
			this.sendGame("changePage", title);
		}

		if (title === this.getGame().settings.endPage.value) {
			this.setState({
				finished: true,
			});
			return;
		}

		fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${title}&format=json&redirects=true&Sdisableeditsection=1&origin=*`)
			.then(res => res.json())
			.then(json => {
				this.setState({
					currentPageContent: json.parse.text["*"],
				});
			});
	}

	protected handleData(event: EventObject<WikiRaceMessageTypings>) {
		if (event.type === "currentPaths") {
			this.setState({
				paths: event.data,
			});
		} else if (event.type === "changedPage") {
			this.setState(oldState => {
				const oldPaths = [...oldState.paths];

				oldPaths.filter(path => path.id === event.data.id)[0].pages.push(event.data.page);

				return {
					paths: oldPaths,
				};
			});
		} else if (event.type === "gameFinished") {
			this.setState(oldState => {
				oldState.finishedAt.set(event.data.id, event.data.finishedAt);

				return { finishedAt: new Map(oldState.finishedAt) };
			});
		}
	}

	protected onStart() {
		this.changePage(this.getGame().settings.startPage.value, true);
	}

	protected getDefaultState(): WikiRaceTypings {
		return {
			currentPage: undefined,
			currentPageContent: undefined,
			finished: false,
			finishedAt: new Map(),
			paths: [],
		};
	}
}