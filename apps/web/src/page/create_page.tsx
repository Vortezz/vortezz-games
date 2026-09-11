import LayoutPage from "./layout_page";
import { useContext, useState } from "react";
import { WebsocketContext } from "../context/websocket_context";

export default function CreatePage() {
	const { createWebsocket } = useContext(WebsocketContext);

	const [roomName, setRoomName] = useState("");
	const [name, setName] = useState("");
	const [needsPassword, setNeedsPassword] = useState(false);
	const [password, setPassword] = useState<undefined | string>(undefined);

	return <LayoutPage>
		<div className={"m-auto flex flex-col gap-4 p-8 bg-[#32006F] rounded-md rounded-xl border border-[#232323] gradient-reverse"}>
			<h3>Create a game</h3>
			<div>
				<label htmlFor={"roomName"}>Room name</label>
				<input defaultValue={roomName}
					className={"bg-[#32006F] border-[#232323] text-white"}
					onChange={(e) => setRoomName(e.target.value)}
					id={"roomName"} />
			</div>
			<div>
				<label htmlFor={"name"}>Your name</label>
				<input defaultValue={name}
					className={"bg-[#32006F] border-[#232323] text-white"}
					onChange={(e) => setName(e.target.value)}
					id={"name"} />
			</div>
			<div className={"flex items-center gap-4"}>
				<input id={"needsPassword"}
					type={"checkbox"}
					className={"w-fit"}
					defaultChecked={needsPassword}
					onChange={(e) => {
						setNeedsPassword(e.target.checked);

						if (!e.target.checked) {
							setPassword(undefined);
						}
					}} />
				<label htmlFor={"needsPassword"}>Password-protected?</label>
			</div>
			{needsPassword ? (<div>
				<label htmlFor={"password"}>Password</label>
				<input defaultValue={password}
					className={"bg-[#32006F] border-[#232323] text-white"}
					type={"password"}
					onChange={(e) => setPassword(e.target.value)}
					id={"password"} />
			</div>) : null}
			<button disabled={roomName === "" || name === "" || (needsPassword && password === "")}
				onClick={() => {
					createWebsocket({
						name: name,
						roomName: roomName,
						password: password,
					});
				}}
				className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Create game
			</button>
		</div>
	</LayoutPage>;
};