import { useContext } from "react";
import { WebsocketContext } from "../../context/websocket_context";

export function GameEnded() {
	const { websocket } = useContext(WebsocketContext);

	if (!websocket || !websocket.isConnected) {
		return <></>;
	}

	return <div className={"flex flex-col p-8 border border-gray-800 rounded-xl gap-4 w-240 max-w-[90%] m-auto"}
		style={{
			background: "linear-gradient(270deg, #230058 0%, #140033 48.56%, #0E0023 100%)",
		}}>
		<h3>Results</h3>
		<div>
			{(websocket.getRoom()!.game.results ?? []).map((result, id) => {
				return <p key={id}
					className={"mt-2"}>{websocket.getRoom()!.players.get(result.id)!.name} - {result.amount} points</p>; // TODO : Format
			})}
		</div>
		<button className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}
			onClick={() => {
				websocket.setGameStatus("lobby");

				if (websocket.isRoomOwner()) {
					websocket.send("resetGame");
				}
			}}>Back to lobby
		</button>
	</div>;
}