import { AbstractGame, EventObject } from "./abstract_game";
import { JSX, MouseEvent } from "react";
import { WikiRaceMessageTypings } from "@repo/shared/src/message/game/wikirace_message_type";
import { ResultWikiRace } from "./wikirace/result_wikirace";
import { TimerComponent } from "./parts/timer";
import { OverviewContent, WikipediaOverview } from "./wikirace/wikipedia_overview";
import { createPortal } from "react-dom";

interface WikiRaceTypings {
	currentPage: string | undefined;
	currentPageContent: string | undefined;
	finished: boolean;
	finishedAt: Map<string, number>;
	paths: { id: string, pages: string[] }[];
	currentlyHovering: {
		name: string;
		element: HTMLAnchorElement;
	} | undefined;
}

function getAnchor(e: MouseEvent, allowPrevent?: boolean) {
	if (!(e.target instanceof HTMLElement)) {
		e.preventDefault();
		return;
	}

	let element = e.target;
	if (!(e.target instanceof HTMLAnchorElement)) {
		if (element.parentElement) {
			element = element.parentElement;
		} else {
			if (allowPrevent) {
				e.preventDefault();
			}
			return undefined;
		}
	}

	if (!(element instanceof HTMLAnchorElement)) {
		if (allowPrevent) {
			e.preventDefault();
		}
		return undefined;
	}

	return element;
}

export class WikiRaceGame extends AbstractGame<WikiRaceMessageTypings, WikiRaceTypings> {

	private readonly savedOverviews: Map<string, OverviewContent | null> = new Map();

	constructor(props: any) {
		super(props);
	}

	public componentDidMount(): () => void {
		const superResult = super.componentDidMount();

		const preventFind = (e: KeyboardEvent) => {
			if (this.getGame().settings.allowFind.value || this.websocket.getGameStatus() !== "playing") {
				return;
			}

			if (e.code === "F3" || (e.ctrlKey && e.code === "KeyF")) {
				e.preventDefault();
			}
		};

		window.addEventListener("keydown", preventFind);

		return () => {
			superResult();

			window.removeEventListener("keydown", preventFind);
		};
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
					startedAt={this.websocket.getGameStartedAt()}
					settings={this.getGame().settings} />
			</div>;
		}

		return <div className={"game-container bg-white"}>
			<h3 className={"text-black flex"}>Get to {this.getGame().settings.endPage.value} -&nbsp;<TimerComponent startedAt={this.websocket.getGameStartedAt()} /></h3>
			<div className={`wiki-wrapper lang-${this.getGame().settings.language.value}`}>
				{this.state.currentlyHovering && createPortal(<WikipediaOverview
					content={this.savedOverviews.get(this.state.currentlyHovering.name)} />, this.state.currentlyHovering.element)}
				<h1 className={"mw-heading"}>{this.state.currentPage}</h1>
				{this.state.currentPageContent ? <div className={"wiki-wrapper w-[calc(90%)]"}
					onClick={e => {
						const element = getAnchor(e, true);

						if (!element) {
							return;
						}

						const href = element.href;
						if (!href.includes(window.location.origin)) {
							e.preventDefault();
							return;
						}

						if (href.replace(window.location.href.split("#")[0], "").startsWith("#")) {
							return;
						}

						const title = element.title;

						e.preventDefault();

						this.changePage(title);
					}}
					onMouseOver={e => {
						const element = getAnchor(e);

						if (!element) {
							this.setState({
								currentlyHovering: undefined,
							});
							return;
						}

						const title = element.title;
						if (title === "" || title.includes(":")) {
							this.setState({
								currentlyHovering: undefined,
							});
							return;
						}

						this.setState({
							currentlyHovering: {
								name: title,
								element: element
							},
						});

						element.style.position="relative";

						fetch(`https://${this.getGame().settings.language.value}.wikipedia.org/api/rest_v1/page/summary/${title}`)
							.then(res => res.json())
							.then(json => {
								if (!json.thumbnail) {
									this.savedOverviews.set(title, null);
								} else {
									this.savedOverviews.set(title, {
										description: json.extract,
										image: json.thumbnail.source,
									});
								}

								this.forceUpdate();
							});
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
				startedAt={this.websocket.getGameStartedAt()}
				settings={this.getGame().settings} />
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
			currentlyHovering: undefined,
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

		fetch(`https://${this.getGame().settings.language.value}.wikipedia.org/w/api.php?action=parse&prop=text&page=${title}&format=json&redirects=true&useskin=minerva&origin=*`)
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
			currentlyHovering: undefined,
		};
	}
}