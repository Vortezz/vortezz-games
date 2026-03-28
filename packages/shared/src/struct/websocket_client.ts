import { CoreMessageTypings } from "../message/core_message_type";

type Handler<K extends keyof E, E extends CoreMessageTypings> = (data: E[K]) => void;

export class WebSocketClient {

	private readonly ws: WebSocket;
	private game: string;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private callbacks = new Map<string, Handler<any, CoreMessageTypings>[]>();

	public constructor(ws: WebSocket, game: string) {
		this.ws = ws;
		this.game = game;

		ws.addEventListener("message", (message) => {
			const json = JSON.parse(message.data, function (key, value) {
				if (typeof value === "object" && value !== null) {
					if (value.objectType === "map") {
						return new Map(value.value);
					}
				}

				return value;
			});

			const type = json.type as string;
			const data = json.data;

			if (type === undefined) {
				return;
			}

			const handlers = this.callbacks.get(type);

			if (handlers) {
				handlers.forEach((handler) => handler(data));
			}
		});
	}

	public send<E extends CoreMessageTypings, K extends keyof E>(key: K, data?: E[K]) {
		this.ws.send(JSON.stringify({
			type: key,
			data: data,
		}, function (key, value) {
			if (key == "ws" || key == "room" || key == "handlers") {
				return undefined;
			}

			if (value instanceof Map) {
				return {
					objectType: "map",
					value: [...value.entries()],
				};
			}

			return value;
		}));
	}

	public on<E extends CoreMessageTypings, K extends keyof E>(key: K, handler: (data: E[K]) => void) {
		const keyString = key.toString();

		let handlers = this.callbacks.get(keyString);
		if (!handlers) {
			handlers = [];
		}

		handlers.push(handler);

		this.callbacks.set(keyString, handlers);
	}

	public clearHandlers<E extends CoreMessageTypings, K extends keyof E>(key: K) {
		this.callbacks.delete(key.toString());
	}
}