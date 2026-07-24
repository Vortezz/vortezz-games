import LayoutPage from "./layout_page";
import { useContext } from "react";
import { WebsocketContext } from "../context/websocket_context";
import { Navigate } from "react-router-dom";

export default function GamePage() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected()) {
		return <Navigate to={"/"} />;
	}

	return <LayoutPage>
		<div>
			<div>
				<h3>Players</h3>
				{websocket.getRoom()?.getPlayers().map((player, id) => {
					return <div key={id}>{player.name}</div>;
				})}
			</div>
			<div></div>
		</div>
	</LayoutPage>;
};