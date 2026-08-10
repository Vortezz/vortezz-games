import { AbstractGame, EventObject } from "./abstract_game";
import { JSX } from "react";
import { WikiRaceMessageTypings } from "@repo/shared/src/message/game/wikirace_message_type";
import { ResultWikiRace } from "./wikirace/result_wikirace";

interface WikiRaceTypings {
	currentPage: string | undefined;
	currentPageContent: string | undefined;
	finished: boolean;
	paths: { id: string, pages: string[] }[];
}

export class WikiRaceGame extends AbstractGame<WikiRaceMessageTypings, WikiRaceTypings> {

	constructor(props: any) {
		super(props);

		this.state = {
			currentPage: undefined,
			currentPageContent: undefined,
			finished: false,
			paths: [],
		};
	}

	public renderPlaying(): JSX.Element {
		if (this.state.finished) {
			return <div className={"game-container gradient-reverse"}>
				<ResultWikiRace paths={this.state.paths}
					startPage={this.getGame().settings.startPage.value}
					endPage={this.getGame().settings.endPage.value}
					players={this.getRoom().players} />
			</div>;
		}

		return <div className={"game-container bg-white"}>
			<div className={"wiki-wrapper"}>
				<h1>{this.state.currentPage}</h1>
				{this.state.currentPageContent ? <div className={"wiki-wrapper w-[calc(90%)]"}
					onClick={e => {
						e.preventDefault();

						if (!(e.target instanceof HTMLAnchorElement)) {
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
				players={this.getRoom().players} />
			{this.getLobbyButton()}
		</div>;
	}

	private changePage(title: string, skipWs?: boolean) {
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
		}
	}

	protected onStart() {
		this.changePage(this.getGame().settings.startPage.value, true);
	}
}