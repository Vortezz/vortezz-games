import LayoutPage from "./layout_page";
import { useContext } from "react";
import { WebsocketContext } from "../context/websocket_context";
import { Navigate } from "react-router-dom";
import { RockPaperScissorsGame } from "../components/game/game_rps";
import { WikiRaceGame } from "../components/game/game_wikirace";
import { BlindtestGame } from "../components/game/game_blindtest";

export default function GamePage() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected()) {
		return <Navigate to={"/"} />;
	}

	let gameComponent;
	if (websocket.getRoom()!.game.type === "rps") {
		gameComponent = <RockPaperScissorsGame />;
	} else if (websocket.getRoom()!.game.type === "wikirace") {
		gameComponent = <WikiRaceGame />;
	} else if (websocket.getRoom()!.game.type === "blindtest") {
		gameComponent = <BlindtestGame />;
	} else {
		gameComponent = <></>;
	}

	return <LayoutPage>
		{gameComponent}
	</LayoutPage>;
};