import { useContext } from "react";
import { WebsocketContext } from "../../context/websocket_context";
import { GameRockPaperScissors } from "./game/game_rps";

export function GamePlaying() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected) {
		return <></>;
	}

	if (websocket.getRoom()?.game.type === "rps") {
		return <div className={"flex flex-col p-8 border border-gray-800 rounded-xl gap-4 w-240 max-w-[90%] m-auto items-center"}
			style={{
				background: "linear-gradient(270deg, #230058 0%, #140033 48.56%, #0E0023 100%)",
			}}><GameRockPaperScissors />
		</div>;
	}

	return <div className={"flex flex-col p-8 border border-gray-800 rounded-xl gap-4 w-240 max-w-[90%] m-auto"}
		style={{
			background: "linear-gradient(270deg, #230058 0%, #140033 48.56%, #0E0023 100%)",
		}}>
	</div>;
}