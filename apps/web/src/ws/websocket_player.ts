import { AbstractWebSocket, RoomTypings } from "@repo/shared";
import { router } from "../router";
import { NotificationType } from "../context/notification_context";

export default class WebsocketPlayer extends AbstractWebSocket {

	private readonly forceUpdate: () => void;
	private readonly showNotification: (type: NotificationType, message: string) => void;
	private room: RoomTypings | undefined;
	private gameStatus: "lobby" | "playing" | "results" = "lobby";
	private gameStartedAt: number = 0;
	private playerId: string | undefined;
	private settingsVersion: number = 0;

	private gameEventHandler: ((data: {
		type: string;
		data: any;
	}) => void) | undefined;

	// TODO : Load self

	constructor(ws: WebSocket, forceUpdate: () => void, showNotification: (type: NotificationType, message: string) => void) {
		super(ws);

		ws.addEventListener("close", (e) => {
			if (e.code !== 3000) {
				showNotification("error", "Unexpected error occurred");
				router.navigate("/");
			}
		});

		this.forceUpdate = forceUpdate;
		this.showNotification = showNotification;

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

		this.on("settingUpdated", (data) => {
			this.room!.game!.settings[data.name].value = data.value;
			this.settingsVersion++;

			this.forceUpdate();
		});

		this.on("playerJoined", (data) => {
			this.room?.players.set(data.id, data);

			this.forceUpdate();

			this.showNotification("enter", `${data.name} joined`);
		});

		this.on("playerLeft", (data) => {
			this.room?.players.delete(data.id);

			this.forceUpdate();

			this.showNotification("exit", `${data.name} left`);
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

		this.on("error", (error) => {
			this.showNotification("error", error);
		});

		this.on("needsPassword", (data) => {
			this.showNotification("info", "This room needs a password");

			router.navigate(`/join${data}`);
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

	public getSettingsVersion() {
		return this.settingsVersion;
	}

	public getPlayerId() {
		return this.playerId;
	}

	public setGameEventHandler(handler: ((data: {
		type: string,
		data: any
	}) => void) | undefined) {
		this.gameEventHandler = handler;
	}
}