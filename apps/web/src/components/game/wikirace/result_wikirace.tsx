import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { GamePlayer, Settings } from "@repo/shared";
import { TimerComponent } from "../parts/timer";

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
		<table className={"text-white w-full text-left"}>
			<thead className={"border-b-white border-b"}>
			<tr>
				<th className={"w-48"}>Name</th>
				<th className={"w-28"}>Timer</th>
				<th className={"w-20"}>Clics</th>
				<th className={"w-[calc(100%-24rem)]"}>Pages visited</th>
			</tr>
			</thead>
			<tbody>
			{paths
				.sort((a, b) => {
					if (settings.ranking.value === "fastest") {
						return (finishedAt.get(a.id) ?? 1e10) - (finishedAt.get(b.id) ?? 1e10);
					} else {
						return a.pages.length - b.pages.length;
					}
				})
				.map((path) => <tr>
					<td>{players.get(path.id)!.name}</td>
					<td><TimerComponent startedAt={startedAt}
						finishedAt={finishedAt.get(path.id)} /></td>
					<td>{path.pages.length - 1}</td>
					<td>{path.pages.join(" → ")}</td>
				</tr>)}
			</tbody>
		</table>
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