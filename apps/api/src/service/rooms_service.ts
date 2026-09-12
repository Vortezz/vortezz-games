import { AvailableGames, GameTypes, generateString, Setting, validateSetting } from "@repo/shared";
import { Room } from "../struct/room";
import { WebSocketClient } from "../struct/websocket_client";
import { RockPaperScissorsGame } from "../struct/game/rps_game";
import { WikiRaceGame } from "../struct/game/wikirace_game";
import { BlindtestGame } from "../struct/game/blindtest_game";

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

	private currentRooms = new Map<string, Room>();

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

	public registerPlayer(room: Room, wsClient: WebSocketClient, name: string, id: string) {
		if (room.getPlayers().find(player => player.name === name)) {
			wsClient.send("error", "Name already used");
			wsClient.close(3000);
			return;
		}

		const otherPlayers = room.getPlayers();

		const isOwner = room.registerPlayer(name, wsClient, id, undefined);

		wsClient.send("self", id);
		wsClient.send("roomData", room);

		if (isOwner) {
			wsClient.on("startGame", () => {
				const gameType = AvailableGames[room.game.type];

				if (gameType.minPlayers > room.players.size
					|| room.players.size > gameType.maxPlayers) {
					wsClient.send("error", "Invalid player count");
					return;
				}

				this.startGame(room);
			});

			wsClient.on("setType", (type) => {
				createGame(type, room);

				room.broadcast("roomData", room);
			});

			wsClient.on("setSetting", change => {
				const setting = room.game.settings[change.name];

				if (!setting) {
					wsClient.send("error", "Invalid setting");
					return;
				}

				if (setting.value === change.value) {
					return;
				}

				validateSetting(setting.type, change.value, change.name, room.game.settings).then(bool => {
					if (!bool) {
						return;
					}

					setting.value = change.value;

					room.game.handleSettingChange(change.name, change.value);

					room.broadcast("settingUpdated", change);
				});
			});

			wsClient.on("resetGame", () => {
				const settings = room.game.settings;

				createGame(room.game.type, room);

				room.game.settings = settings;

				room.broadcast("roomData", room);
			});

			wsClient.on("kickPlayer", (data) => {
				const player = room.players.get(data);
				if (!player) {
					return;
				}

				room.players.delete(data);

				const ws = player.ws!;
				ws.close(4001); // Kick code

				room.broadcast("playerKicked", data);
			});
		}

		wsClient.on("ping", () => wsClient.send("pong"));
		wsClient.on("gameEvent", (data) => room.handleGameEvent(wsClient, data));

		wsClient.on("leaveGame", () => {
			const clientId = wsClient.getId();
			room.players.delete(clientId);

			wsClient.close(4002); // Left game

			room.broadcast("playerLeft", clientId);
		});

		otherPlayers.forEach(player => player.ws?.send("playerJoined", room.getPlayers().pop()));

		room.game.registerClient(wsClient);

		console.log(`[${"INFO / Room".blue}] Player ${name} joined room ${room.id}`);
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
}