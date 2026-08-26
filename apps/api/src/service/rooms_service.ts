import { GameTypes, generateString } from "@repo/shared";
import { Room } from "../struct/room";
import { WebSocketClient } from "../struct/websocket_client";
import { RockPaperScissorsGame } from "../struct/game/rps_game";
import { WikiRaceGame } from "../struct/game/wikirace_game";

function createGame(type: GameTypes, room: Room) {
	switch (type) {
		case "wikirace":
			room.game = new WikiRaceGame(room);
			break;
		case "rps":
			room.game = new RockPaperScissorsGame(room);
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
			wsClient.on("startGame", () => this.startGame(room));

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

				setting.value = change.value; // TODO : Check if valid

				room.game.handleSettingChange(change.name, change.value);

				room.broadcast("settingUpdated", change);
			});

			wsClient.on("resetGame", () => {
				const settings = room.game.settings;

				createGame(room.game.type, room);

				room.game.settings = settings;

				room.broadcast("roomData", room);
			});
		}

		wsClient.on("ping", () => wsClient.send("pong"));
		wsClient.on("gameEvent", (data) => room.handleGameEvent(wsClient, data));

		otherPlayers.forEach(player => player.ws?.send("playerJoined", room.getPlayers().pop()));

		room.game.registerClient(wsClient);

		console.log("Registered");
	}

	private startGame(room: Room) {
		const game = room.getGame();

		if (game === undefined) {
			room.getPlayers().find(player => player.owner)?.ws?.send("error", "Unknown error");
			return;
		}

		game.room.broadcast("gameStarted");

		setTimeout(() => {
			game.startGame();
		}, 100);
	}
}