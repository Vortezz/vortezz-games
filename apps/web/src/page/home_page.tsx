import LayoutPage from "./layout_page";
import { Link } from "react-router-dom";

export default function HomePage() {
	return <LayoutPage>
		<div className={"text-6xl font-semibold text-white ml-12 gap-4 flex flex-col"}>
			<h1><span className={"font-black"}>Play</span> with your <span className={"font-black"}>friends</span>,</h1>
			<h1><span className={"font-black"}>online</span> and for <span className={"font-black"}>free</span>!</h1>
		</div>
		<div className={"w-116 ml-12 mb-8"}>
			<Link className={"bg-lime-300 rounded-xl h-20 w-full flex items-center justify-center"}
				to={"/create"}>CREATE A GAME
			</Link>
			<div className={"flex flex-row text-[#676767] items-center my-4"}>
				<hr className={"w-full mr-4"} />
				<span>OR</span>
				<hr className={"w-full ml-4"} />
			</div>
			<div className={"text-[#676767] text-xs mb-2"}>Having a code? Join your friend’s game.</div>
			<div className={"flex gap-4"}>
				<input maxLength={1}
					className={"h-20 w-20 rounded-xl border border-[#676767] bg-[#32006F]"}></input>
				<input maxLength={1}
					className={"h-20 w-20 rounded-xl border border-[#676767] bg-[#32006F]"}></input>
				<input maxLength={1}
					className={"h-20 w-20 rounded-xl border border-[#676767] bg-[#32006F]"}></input>
				<input maxLength={1}
					className={"h-20 w-20 rounded-xl border border-[#676767] bg-[#32006F]"}></input>
				<div className={"h-20 w-20 rounded-xl border bg-[#FF4882]"}></div>
			</div>
		</div>
	</LayoutPage>;
}