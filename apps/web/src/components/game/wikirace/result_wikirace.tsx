import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import { GamePlayer, Settings } from "@repo/shared";
import { TimerComponent } from "../parts/timer";
import { WebsocketContext } from "../../../context/websocket_context";

export function ResultWikiRace({ paths, startPage, endPage, players, finishedAt, startedAt, settings }: {
	paths: { id: string, pages: string[] }[],
	startPage: string,
	endPage: string,
	players: Map<string, GamePlayer>,
	finishedAt: Map<string, number>,
	startedAt: number,
	settings: Settings
}) {
	const ref = useRef<SVGSVGElement>(null);
	const { websocket } = useContext(WebsocketContext);

	if (!websocket) {
		return <></>;
	}

	useEffect(() => {
		const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

		const width = Math.min(window.screen.width * 0.9, 60 * rootFontSize) - 20;
		const height = 600;

		const svg = d3.select(ref.current);
		svg.selectChildren()
			.remove();

		svg.attr("width", width)
			.attr("height", height)
			.attr("viewBox", [0, 0, width, height])
			.attr("style", "max-width: 100%; height: auto;");

		const allPagesWithDoubles = paths.reduce((a, b) => {
			a.push(...b.pages);

			return a;
		}, [] as string[]);

		const allPages = [...new Set(allPagesWithDoubles)].map(page => ({
			id: page,
			group: 0,
		}));

		const allLinksMap: Map<string, number> = new Map();

		for (let path of paths) {
			for (let i = 0; i < path.pages.length - 1; i++) {
				const id: string = `${path.pages[i]}||||${path.pages[i + 1]}`;

				const oldValue = allLinksMap.get(id) ?? 0;

				allLinksMap.set(id, oldValue + 1);
			}
		}

		const allLinks = [...allLinksMap.entries()].map((item) => {
			const splitted = item[0].split("||||");

			return ({
				source: splitted[0],
				target: splitted[1],
				value: item[1],
			});
		});

		const allArrowSizes = new Set(allLinks.map(item => item.value));

		const defs = svg.append("defs");

		for (let size of allArrowSizes) {
			defs.append("marker")
				.attr("id", `head-${size}`)
				.attr("orient", "auto")
				.attr("markerWidth", "3")
				.attr("markerHeight", "4")
				.attr("refX", 6 - size)
				.attr("refY", "2")
				.insert("path")
				.attr("d", "M0,0 V4 L2,2 Z")
				.attr("fill", "white");
		}

		// @ts-ignore
		const simulation = d3.forceSimulation(allPages)
			// @ts-ignore
			.force("link", d3.forceLink(allLinks).id(d => d.id).distance(125 - 7.5 * Math.sqrt(allLinks.length)))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2))
			.on("tick", ticked);

		const link = svg.append("g")
			.attr("stroke", "#fff")
			.selectAll()
			.data(allLinks)
			.join("line")
			.attr("stroke-width", d => 3 * Math.sqrt(d.value))
			.attr("marker-end", d => `url(#head-${d.value})`);

		const node = svg.append("g")
			.attr("stroke-width", 1.5)
			.selectAll()
			.data(allPages)
			.join("circle")
			.attr("r", 10)
			.attr("stroke", d => {
				if (startPage === d.id) {
					return "#0b0";
				} else if (endPage === d.id) {
					return "#b00";
				} else {
					return "#00b";
				}
			})
			.attr("fill", d => {
				if (startPage === d.id) {
					return "#0f0";
				} else if (endPage === d.id) {
					return "#f00";
				} else {
					return "#00f";
				}
			});

		node.append("title")
			.text(d => d.id);

		// @ts-ignore
		node.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));

		function ticked() {
			link
				// @ts-ignore
				.attr("x1", d => d.source.x)
				// @ts-ignore
				.attr("y1", d => d.source.y)
				// @ts-ignore
				.attr("x2", d => d.target.x)
				// @ts-ignore
				.attr("y2", d => d.target.y);

			node
				// @ts-ignore
				.attr("cx", d => d.x)
				// @ts-ignore
				.attr("cy", d => d.y);
		}

		function dragstarted(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
	}, [paths]);

	return <>
		<div className={"overflow-x-auto w-full block min-w-0"}>
			<table className={"text-white text-left table-fixed w-full min-w-160"}>
				<thead className={"border-b-white border-b"}>
				<tr>
					<th className={"w-1/6"}>Name</th>
					<th className={"w-1/6"}>Timer</th>
					<th className={"w-1/6"}>Clics</th>
					<th className={"w-1/2"}>Pages visited</th>
				</tr>
				</thead>
				<tbody className={"overflow-auto"}>
				{paths
					.sort((a, b) => {
						if (settings.ranking.value === "fastest") {
							return (finishedAt.get(a.id) ?? 1e20) - (finishedAt.get(b.id) ?? 1e20);
						} else {
							return a.pages.length - b.pages.length;
						}
					})
					.map((path) => <tr key={path.id}
						className={"border-b-white border-b border-0.5"}>
						<td>{players.get(path.id)!.name}</td>
						<td><TimerComponent startedAt={startedAt}
							finishedAt={finishedAt.get(path.id)}
							couldNA={!finishedAt.has(path.id) && websocket.getGameStatus() === "results"} /></td>
						<td>{path.pages.length - 1}</td>
						<td className={"py-2 break-words"}>{path.pages.join(" → ")}</td>
					</tr>)}
				</tbody>
			</table>
		</div>
		<h3 className={"mt-8"}>Pages graph</h3>
		<svg
			ref={ref}>
			<defs>
				<marker
					id="head"
					orient="auto"
					markerWidth="3"
					markerHeight="4"
					refX="5"
					refY="2"
				>
					<path d="M0,0 V4 L2,2 Z"
						fill="black" />
				</marker>
			</defs>
		</svg>
	</>;
}