import { WebSocketServer } from "ws";
import GamesService from "./games_service";
import { AbstractGame, CoreMessageTypings, WebSocketClient } from "@repo/shared";

export default class CoreWebsocketService {

	public static INSTANCE: CoreWebsocketService = new CoreWebsocketService();

	// TODO : Store WS clients

	public initialize(): void {
		console.log("Initializing CoreWebsocketService");

		const PORT = parseInt(process.env.PORT ?? "") || 3000;
		const wss = new WebSocketServer({ port: PORT }, () => {
			console.log(`Ready`);
		});

		wss.on("connection", (ws, req) => {
			console.log(`Websocket connection connected: ${ws}`);
			const urlSearchParams = new URLSearchParams(req.url?.split("?").slice(1).join("?"));

			const id = urlSearchParams.get("id"); // TODO : Action to create game
			const name = urlSearchParams.get("name");
			const roomName = urlSearchParams.get("roomName");
			const password = urlSearchParams.get("password");
			const action = urlSearchParams.get("action");

			if (name === null || name === ""
				|| action === null || action === ""
				|| ((id === null || id === "") && action !== "create")
				|| ((roomName === null || roomName === "") && action === "create")) {
				// TODO
				console.log("Missing argument")
				ws.close(3000);
				return;
			}

			let game: AbstractGame<CoreMessageTypings> | undefined;
			if (action === "create") {
				game = GamesService.INSTANCE.createGame(roomName ?? "", password);
			} else {
				game = GamesService.INSTANCE.getGame(id ?? "");

				if (game && !game.checkPassword(password)) {
					// TODO
					console.log("Invalid pswd")
					return;
				}
			}

			if (game === undefined) {
				// TODO
				console.log("No game")
				return;
			}

			// eslint-disable-next-line
			// @ts-ignore
			const wsClient = new WebSocketClient(ws, game);

			// TODO : Store WS

			GamesService.INSTANCE.registerPlayer(game, wsClient, name);

			// TODO : Generate player id
		});
	}
}