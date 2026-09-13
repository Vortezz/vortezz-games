import { Component, ContextType } from "react";
import { WebsocketContext, WebsocketContextProps } from "../../context/websocket_context";
import { GameLobby } from "./parts/game_lobby";
import WebsocketPlayer from "../../ws/websocket_player";
import { CoreMessageTypings } from "@repo/shared";

export type EventObject<E> = {
	[K in keyof E]: { type: K; data: E[K] };
}[keyof E];

export abstract class AbstractGame<MessageTypings extends CoreMessageTypings, IState> extends Component<any, IState> {

	static contextType = WebsocketContext;
	declare context: ContextType<typeof WebsocketContext>;

	protected websocket!: WebsocketPlayer;

	protected constructor(props: any) {
		super(props);

		this.state = this.getDefaultState();
	}

	public componentDidMount() {
		const context: WebsocketContextProps = this.context;

		this.websocket = context!.websocket!;

		this.websocket.setGameEventHandler(event => {
			if (event.type === "gameStarted") {
				this.onStart();
				return;
			}

			this.handleData(event as EventObject<MessageTypings>);
		});

		this.forceUpdate();

		return () => this.websocket.setGameEventHandler(undefined);
	}

	public render() {
		if (!this.websocket || !this.websocket.isConnected()) {
			return <></>;
		}

		if (this.websocket.getGameStatus() === "lobby") {
			return this.renderLobby();
		} else if (this.websocket.getGameStatus() === "playing") {
			return this.renderPlaying();
		} else {
			return this.renderResults();
		}
	}

	protected renderLobby() {
		return <GameLobby />;
	}

	protected renderPlaying() {
		return <></>;
	}

	protected renderResults() {
		return <div className={"game-container gradient-reverse"}>
			<h3>Results</h3>
			<div>
				{(this.websocket.getRoom()!.game.results ?? []).map((result, id) => {
					return <p key={id}
						className={"mt-2"}>{this.websocket.getRoom()!.players.get(result.id)!.name} - {result.amount} points</p>; // TODO : Format
				})}
			</div>
			{this.getLobbyButton()}
		</div>;
	}

	protected getLobbyButton() {
		return <button className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}
			onClick={() => {
				this.websocket.setGameStatus("lobby");

				if (this.websocket.isRoomOwner()) {
					this.websocket.send("resetGame");
				}

				this.setState(this.getDefaultState());
			}}>Back to lobby
		</button>;
	}

	protected sendGame<K extends keyof MessageTypings>(key: K, data?: MessageTypings[K]) {
		this.websocket.send("gameEvent", { type: key as string, data });
	}

	protected getRoom() {
		return this.websocket.getRoom()!;
	}

	protected getGame() {
		return this.websocket.getRoom()!.game;
	}

	protected onStart() {
		// to override
	}

	protected handleData(event: EventObject<MessageTypings>): void {
		if (event.type === "syncState") {
			// @ts-ignore
			this.setState(event.data);
		}
	}

	protected abstract getDefaultState(): IState;
}