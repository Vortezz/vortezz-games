import { AbstractWebSocket, GameStatus, RoomTypings } from "@repo/shared";
import { router } from "../router";
import { NotificationType } from "../context/notification_context";

export default class WebsocketPlayer extends AbstractWebSocket {

	private readonly forceUpdate: () => void;
	private readonly showNotification: (type: NotificationType, message: string) => void;
	private room: RoomTypings | undefined;
	private gameStatus: GameStatus = "lobby";
	private gameStartedAt: number = 0;
	private playerId: string | undefined;
	private settingsVersion: number = 0;

	private gameEventHandler: ((data: {
		type: string;
		data: any;
	}) => void) | undefined;

	constructor(ws: WebSocket, forceUpdate: () => void, showNotification: (type: NotificationType, message: string) => void) {
		super(ws);

		ws.addEventListener("close", (e) => {
			if (e.code === 4001) { // Kick
				router.navigate("/");
				showNotification("warning", "You were kicked from the game");
				return;
			}

			if (e.code === 4002) { // Leave
				router.navigate("/");
				showNotification("success", "You left the game");
				return;
			}

			if (e.code === 4003) { // Failed to rejoin
				localStorage.removeItem("lastGame");
				return;
			}

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

			localStorage.setItem("lastGame", JSON.stringify({
				playerId: this.playerId,
				roomId: this.room.id,
				timestamp: Date.now(),
			}));

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

		this.on("playerDisconnected", (data) => {
			const player = this.room?.players.get(data);
			if (!player) {
				return;
			}

			this.showNotification("warning", `${player.name} has disconnected, they have 30 seconds to reconnect`);
		});

		this.on("playerRejoined", (data) => {
			const player = this.room?.players.get(data);
			if (!player) {
				return;
			}

			this.showNotification("enter", `${player.name} has rejoined`);
		});

		this.on("playerLeft", (data) => {
			const player = this.room?.players.get(data);
			if (!player) {
				return;
			}

			this.room?.players.delete(data);

			this.forceUpdate();

			this.showNotification("exit", `${player.name} has left`);
		});

		this.on("playerKicked", (data) => {
			const player = this.room?.players.get(data);
			if (!player) {
				return;
			}

			this.room?.players.delete(data);

			this.forceUpdate();

			this.showNotification("exit", `${player.name} was kicked`);
		});

		this.on("newOwner", (data) => {
			const player = this.room?.players.get(data);
			if (!player) {
				return;
			}

			player.owner = true;

			this.forceUpdate();

			this.showNotification("info", `${player.name} is the new owner`);
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

		this.on("statusSync", (data) => {
			this.gameStartedAt = data.startedAt ?? 0;
			this.setGameStatus(data.status);
		});

		this.on("pong", () => {
			localStorage.setItem("lastGame", JSON.stringify({
				playerId: this.playerId,
				roomId: this.room!.id,
				timestamp: Date.now(),
			}));
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