import LayoutPage from "./layout_page";
import { useContext } from "react";
import { WebsocketContext } from "../context/websocket_context";
import { Navigate } from "react-router-dom";
import { GameLobby } from "../components/game/game_lobby";
import { GamePlaying } from "../components/game/game_playing";
import { GameEnded } from "../components/game/game_ended";

export default function GamePage() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected()) {
		return <Navigate to={"/"} />;
	}

	let gameComponent;
	console.log(websocket.getGameStatus());
	if (websocket.getGameStatus() === "lobby") {
		gameComponent = <GameLobby />;
	} else if (websocket.getGameStatus() === "playing") {
		gameComponent = <GamePlaying />;
	} else {
		gameComponent = <GameEnded />;
	}

	return <LayoutPage>
		{gameComponent}
	</LayoutPage>;
};