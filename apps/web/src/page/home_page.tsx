import LayoutPage from "./layout_page";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function replaceCharacter(string: string, index: number, replacement: string) {
	return string.substring(0, index) + replacement + string.substring(index + replacement.length);
}

function CodeInput({ id, code, setCode }: { id: number, code: string, setCode: (value: string) => void }) {
	return <input maxLength={2}
		id={`code-input-${id}`}
		onPaste={(e) => {
			const data = e.clipboardData.getData("text/plain");
			let newCode = code;
			let lastIndex = id;
			for (let j = 0; j < Math.min(4 - id, data.length); j++) {
				const realId = j + id;
				const nextInput = document.getElementById(`code-input-${realId}`) as HTMLInputElement;

				if (nextInput) {
					nextInput.value = data[j];
					newCode = replaceCharacter(newCode, realId, data[j]);
				}

				lastIndex++;
			}

			setCode(newCode);

			if (lastIndex < 4) {
				const nextInput = document.getElementById(`code-input-${lastIndex}`) as HTMLInputElement;
				if (nextInput) {
					nextInput.focus();
				}
			} else {
				const currInput = document.getElementById(`code-input-${id}`) as HTMLInputElement;
				if (currInput) {
					currInput.blur();
				}
			}
		}}
		onChange={(e) => {
			e.target.value = e.target.value[e.target.value.length - 1] ?? "";
			const newCode = replaceCharacter(code, id, e.target.value[0] ?? " ");
			setCode(newCode);

			if (id === 3 || e.target.value === "") {
				return;
			}

			const nextInput = document.getElementById(`code-input-${id + 1}`) as HTMLInputElement;
			if (nextInput) {
				nextInput.focus();
			}
		}}
		className={"h-20 w-20 text-center text-white text-3xl rounded-xl border border-[#676767] bg-[#32006F]"}></input>;
}

export default function HomePage() {
	const [code, setCode] = useState("    ");
	const navigate = useNavigate();

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
				{[0, 1, 2, 3].map((id) => <CodeInput id={id}
					code={code}
					setCode={setCode}
					key={id} />)}
				<button className={"h-20 w-20 rounded-xl border bg-[#FF4882]"}
					disabled={code.includes(" ")}
					onClick={() => {
						navigate(`/join?id=${code}`);
					}}></button>
			</div>
		</div>
	</LayoutPage>;
}