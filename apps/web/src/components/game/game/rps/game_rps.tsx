import { useContext, useEffect, useState } from "react";
import { RpsMessageTypings, RpsPossibilites } from "@repo/shared";
import { WebsocketContext } from "../../../../context/websocket_context";

const POSSIBILITY_TO_EMOJI = {
	"rock": "🪨",
	"paper": "📃",
	"scissors": "✂️",
};

export function GameRockPaperScissors() {
	const { websocket } = useContext(WebsocketContext);

	const [playable, setPlayable] = useState(false);
	const [result, setResult] = useState<{ winner: string | undefined, picks: Map<string, RpsPossibilites> } | undefined>();
	const [score, setScore] = useState<Map<string, number>>(new Map()); // TODO : Score feedback
	const [pick, setPick] = useState<RpsPossibilites | undefined>();

	useEffect(() => {
		if (!websocket || !websocket.isConnected()) {
			return;
		}

		websocket.setGameEventHandler((data) => {
			if (data.type === "playable") {
				setPlayable(data.data);
				setPick(undefined);
			} else if (data.type === "setScore") {
				setScore(data.data);
			} else if (data.type === "result") {
				setResult(data.data);
			}
		});

		return () => websocket.setGameEventHandler(undefined);
	}, []);

	useEffect(() => {
		if (pick) {
			websocket?.sendGame<RpsMessageTypings, any>("select", pick);
		}
	}, [pick]);

	if (!websocket || !websocket.isConnected()) {
		return <></>;
	}

	if (playable) {
		return <>
			<h2>Pick your object:</h2>
			<div className={"flex gap-16 mt-4"}>
				<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
					onClick={() => setPick("rock")}>🪨<span className={"text-8xl"}> </span>
				</div>
				<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
					onClick={() => setPick("paper")}>📃
				</div>
				<div className={"text-7xl cursor-pointer hover:text-8xl transition-all"}
					onClick={() => setPick("scissors")}>✂️
				</div>
			</div>
		</>;
	}

	if (result) {
		const players = [...websocket.getRoom()?.players.values() ?? []];

		return <>
			{result.winner ? <h3>{websocket.getRoom()?.players.get(result.winner)?.name} wins the round</h3> : <h3>Draw!</h3>}
			<div className={"flex gap-32 mt-4"}>
				<div className={"flex flex-col items-center"}>
					<div className={"text-7xl"}>{POSSIBILITY_TO_EMOJI[result.picks.get(players[0].id) ?? "paper"]}</div>
					<p>{players[0].name}</p>
				</div>
				<div className={"flex flex-col items-center"}>
					<div className={"text-7xl"}>{POSSIBILITY_TO_EMOJI[result.picks.get(players[1].id) ?? "paper"]}</div>
					<p>{players[1].name}</p>
				</div>
			</div>
		</>;
	}

	return <p>Chargement en cours...</p>;
}