import { useContext, useEffect, useState } from "react";
import { WebsocketContext } from "../../../../context/websocket_context";
import { WikiRaceMessageTypings } from "@repo/shared";
import { ResultWikiRace } from "./result_wikirace";

export function WikiRaceGame() {
	const { websocket } = useContext(WebsocketContext);

	const [currentPage, setCurrentPage] = useState(websocket?.getRoom()!.game!.settings.startPage.value);
	const [currentPageContent, setCurrentPageContent] = useState<string | undefined>(undefined);
	const [finished, setFinished] = useState<boolean>(false);
	const [paths, setPaths] = useState<{ id: string, pages: string[] }[]>([]);

	useEffect(() => {
		if (!websocket || !websocket.isConnected()) {
			return;
		}

		websocket.setGameEventHandler((data) => {
			if (data.type === "currentPaths") {
				setPaths(data.data);
			} else if (data.type === "changedPage") {
				setPaths(oldPaths => {
					oldPaths.filter(path => path.id === data.data.id)[0].pages.push(data.data.page);

					return [...oldPaths];
				});
			}
		});

		return () => websocket.setGameEventHandler(undefined);
	}, []);

	useEffect(() => {
		websocket?.sendGame<WikiRaceMessageTypings, any>("changePage", currentPage);

		if (currentPage === websocket?.getRoom()!.game.settings.endPage.value) {
			setFinished(true);
			return;
		}

		fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${currentPage}&format=json&redirects=true&Sdisableeditsection=1&origin=*`)
			.then(res => res.json())
			.then(json => {
				setCurrentPageContent(json.parse.text["*"]);
			});
	}, [currentPage]);

	if (!websocket || !websocket.isConnected()) {
		return <></>;
	}

	if (finished) {
		return <>
			{paths.map((path) => <p className={"text-black"}>
				{websocket.getRoom()!.players.get(path.id)!.name} - {path.pages.join(" → ")}
			</p>)}
			<ResultWikiRace paths={paths} />
		</>;
	}

	return <>
		<div className={"wiki-wrapper"}>
			<h1>{currentPage}</h1>
			{currentPageContent ? <div className={"wiki-wrapper w-[calc(90%)]"}
				onClick={e => {
					e.preventDefault();

					if (!(e.target instanceof HTMLAnchorElement)) {
						return;
					}

					setCurrentPage(e.target.title);
					setCurrentPageContent(undefined);
				}}
				dangerouslySetInnerHTML={{ __html: currentPageContent }} /> : <p>Chargement en cours...</p>}
		</div>
	</>;
};
;