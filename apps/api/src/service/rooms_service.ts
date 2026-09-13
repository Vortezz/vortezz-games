import { AvailableGames, GamePlayer, GameTypes, generateString, Setting, validateSetting } from "@repo/shared";
import { Room } from "../struct/room";
import { WebSocketClient } from "../struct/websocket_client";
import { RockPaperScissorsGame } from "../struct/game/rps_game";
import { WikiRaceGame } from "../struct/game/wikirace_game";
import { BlindtestGame } from "../struct/game/blindtest_game";
import { GameStatus } from "@repo/shared/src/struct/game";

function createGame(type: GameTypes, room: Room) {
	switch (type) {
		case "wikirace":
			room.game = new WikiRaceGame(room);
			break;
		case "rps":
			room.game = new RockPaperScissorsGame(room);
			break;
		case "blindtest":
			room.game = new BlindtestGame(room);
			break;
	}
}

export default class RoomsService {

	public static INSTANCE: RoomsService = new RoomsService();

	private currentRooms: Map<string, Room> = new Map<string, Room>();
	private roomForPlayer: Map<string, string> = new Map<string, string>();
	private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();
	private lastMessage: Map<string, number> = new Map<string, number>();

	public initialize() {
	}

	public getRoom(id: string): Room | undefined {
		return this.currentRooms.get(id);
	}

	public createRoom(name: string, password: string | null): Room {
		const id = generateString(4);

		const room = new Room(id, name, password);

		this.currentRooms.set(id, room);

		console.log(`[${"INFO / Room".blue}] Room ${room.id} created`);

		return room;
	}

	public registerPlayer(room: Room, wsClient: WebSocketClient, name: string, id: string, isRejoin: boolean) {
		if (!isRejoin && room.getPlayers().find(player => player.name === name)) {
			wsClient.send("error", "Name already used");
			wsClient.close(3000);
			return;
		}

		const otherPlayers = room.getPlayers();

		if (!isRejoin) {
			room.registerPlayer(name, wsClient, id, undefined);
		} else {
			const timeout = this.disconnectionTimers.get(id);

			if (!timeout) {
				return;
			}

			clearTimeout(timeout);
			this.disconnectionTimers.delete(id);
		}

		const clientId = wsClient.getId();
		this.roomForPlayer.set(clientId, id);
		this.lastMessage.set(clientId, Date.now());

		wsClient.send("self", id);
		wsClient.send("roomData", room);

		const game = room.game;

		wsClient.on("startGame", () => {
			if (!this.isOwner(room, wsClient)) {
				return;
			}

			const gameType = AvailableGames[game.type];

			if (gameType.minPlayers > room.players.size
				|| room.players.size > gameType.maxPlayers) {
				wsClient.send("error", "Invalid player count");
				return;
			}

			this.startGame(room);
		});

		wsClient.on("setType", (type) => {
			if (!this.isOwner(room, wsClient)) {
				return;
			}

			createGame(type, room);

			room.broadcast("roomData", room);
		});

		wsClient.on("setSetting", change => {
			if (!this.isOwner(room, wsClient)) {
				return;
			}

			const setting = game.settings[change.name];

			if (!setting) {
				wsClient.send("error", "Invalid setting");
				return;
			}

			if (setting.value === change.value) {
				return;
			}

			validateSetting(setting.type, change.value, change.name, game.settings).then(bool => {
				if (!bool) {
					return;
				}

				setting.value = change.value;

				game.handleSettingChange(change.name, change.value);

				room.broadcast("settingUpdated", change);
			});
		});

		wsClient.on("resetGame", () => {
			if (!this.isOwner(room, wsClient)) {
				return;
			}

			const settings = game.settings;

			createGame(game.type, room);

			game.settings = settings;

			room.broadcast("roomData", room);
		});

		wsClient.on("kickPlayer", (data) => {
			if (!this.isOwner(room, wsClient)) {
				return;
			}

			if (data === wsClient.getId()) {
				return;
			}

			const player = room.players.get(data);
			if (!player) {
				return;
			}

			room.players.delete(data);
			this.roomForPlayer.delete(data);

			const ws = player.ws!;
			ws.close(4001); // Kick code

			room.broadcast("playerKicked", data);
		});

		wsClient.on("ping", () => {
			wsClient.send("pong");

			const lastMessage = this.lastMessage.get(clientId) ?? Date.now();

			if (Date.now() - lastMessage > 30 * 60 * 1000) {
				wsClient.send("error", "You were kicked because of inactivity");
				this.handleLeave(wsClient, room);
			}
		});
		wsClient.on("gameEvent", (data) => room.handleGameEvent(wsClient, data));

		wsClient.on("leaveGame", () => {
			this.handleLeave(wsClient, room);
		});

		wsClient.ws.addEventListener("close", data => {
			this.lastMessage.delete(clientId);

			if (data.code === 3000 || data.code >= 4000) {
				this.roomForPlayer.delete(clientId);
				this.disconnectionTimers.delete(clientId);
				return;
			}

			this.disconnectionTimers.set(clientId, setTimeout(() => this.handleLeave(wsClient, room), 30 * 1000));

			room.broadcast("playerDisconnected", clientId);
		});

		wsClient.ws.addEventListener("message", data => {
			if (!data.data.toString().includes("\"type\":\"ping\"")) {
				this.lastMessage.set(clientId, Date.now());
			}
		});

		if (isRejoin) {
			otherPlayers.forEach(player => player.ws?.send("playerRejoined", clientId));

			room.players.get(clientId)!.ws = wsClient;

			const state = game.getState(clientId);

			let currentStatus: GameStatus = "lobby";
			if (game.results) {
				currentStatus = "results";
			} else if (game.isGameStarted()) {
				currentStatus = "playing";
			}

			setTimeout(() => {
				wsClient.send("statusSync", {
					status: currentStatus,
					startedAt: game.startedAt,
				});
				wsClient.send("gameEvent", {
					type: "syncState",
					data: state,
				});
			}, 100);
		} else {
			otherPlayers.forEach(player => player.ws?.send("playerJoined", room.getPlayers().pop()));

			game.registerClient(wsClient);
		}

		console.log(`[${"INFO / Room".blue}] Player ${name} joined room ${room.id}`);
	}

	private handleLeave(wsClient: WebSocketClient, room: Room) {
		const clientId = wsClient.getId();

		const player = room.players.get(clientId);
		if (!player) {
			return;
		}

		room.players.delete(clientId);

		wsClient.close(4002); // Left game

		room.broadcast("playerLeft", clientId);
		this.roomForPlayer.delete(clientId);
		this.lastMessage.delete(clientId);
		this.disconnectionTimers.delete(clientId);

		if (room.players.size === 0) {
			this.currentRooms.delete(room.getId());
		} else if (player.owner) {
			const newOwner = room.getPlayers()[0];

			newOwner.owner = true;

			room.broadcast("newOwner", newOwner.id);
		}
	}

	private isOwner(room: Room, wsClient: WebSocketClient) {
		const playerSender = room.players.get(wsClient.getId());

		return playerSender && playerSender.owner;
	}

	private async startGame(room: Room) {
		const game = room.getGame();
		const ownerWs = room.getPlayers().find(player => player.owner)?.ws;

		if (game === undefined) {
			ownerWs?.send("error", "Unknown error");
			return;
		}

		for (const [key, settingUkn] of Object.entries(game.settings)) {
			const setting = settingUkn as Setting;

			const validated = await validateSetting(setting.type, setting.value, key, room.game.settings);

			if (!validated) {
				ownerWs?.send("error", "Invalid settings");
				return;
			}
		}

		game.room.broadcast("gameStarted");

		setTimeout(() => {
			game.startGame();
		}, 100);
	}

	public tryRejoin(playerId: string, id: string): [undefined, undefined] | [GamePlayer, Room] {
		const room = this.currentRooms.get(id);

		if (!room) {
			return [undefined, undefined];
		}

		const player = room.players.get(playerId);

		if (!player) {
			return [undefined, undefined];
		}

		return [player, room];
	}
}