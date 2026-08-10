import { AbstractWebSocket, RoomTypings } from "@repo/shared";
import { router } from "../router";

export default class WebsocketPlayer extends AbstractWebSocket {

	private readonly forceUpdate: () => void;
	private room: RoomTypings | undefined;
	private gameStatus: "lobby" | "playing" | "results" = "lobby";
	private gameStartedAt: number = 0;
	private playerId: string | undefined;

	private gameEventHandler: ((data: {
		type: string;
		data: any;
	}) => void) | undefined;

	// TODO : Load self

	constructor(ws: WebSocket, forceUpdate: () => void) {
		super(ws);

		this.forceUpdate = forceUpdate;

		this.setupListener();

		setInterval(() => {
			this.send("ping");
		}, 30000);
	}

	private setupListener() {
		this.on("self", playerId => {
			this.playerId = playerId;

			this.forceUpdate();
		});

		this.on("roomData", (data) => {
			this.room = data;

			if (window.location.pathname !== "/game") {
				router.navigate("/game");
			} else {
				this.forceUpdate();
			}
		});

		this.on("settingsUpdated", (data) => {
			this.room!.game!.settings = data;

			this.forceUpdate();
		});

		this.on("playerJoined", (data) => {
			this.room?.players.set(data.id, data);

			this.forceUpdate();
		});

		this.on("playerLeft", (data) => {
			this.room?.players.delete(data.id);

			this.forceUpdate();
		});

		this.on("gameStarted", () => {
			this.gameStatus = "playing";
			this.gameStartedAt = Date.now();

			if (this.gameEventHandler) {
				this.gameEventHandler({
					type: "gameStarted",
					data: undefined,
				});
			}

			this.forceUpdate();
		});

		this.on("gameEnded", () => {
			this.gameStatus = "results";

			this.forceUpdate();
		});

		this.on("gameEvent", (event) => {
			if (this.gameEventHandler) {
				this.gameEventHandler(event);
			}
		});

		this.on("setResults", (results) => {
			this.room!.game.results = results;
		});
	}

	public isConnected() {
		return this.room !== undefined;
	}

	public getRoom() {
		return this.room;
	}

	public getGameStatus() {
		return this.gameStatus;
	}

	public setGameStatus(gameStatus: typeof this.gameStatus) {
		this.gameStatus = gameStatus;

		this.forceUpdate();
	}

	public isRoomOwner() {
		return this.playerId !== undefined && this.room !== undefined && this.room.players.get(this.playerId)!.owner;
	}

	public getGameStartedAt() {
		return this.gameStartedAt;
	}

	public setGameEventHandler(handler: ((data: {
		type: string,
		data: any
	}) => void) | undefined) {
		this.gameEventHandler = handler;
	}
}