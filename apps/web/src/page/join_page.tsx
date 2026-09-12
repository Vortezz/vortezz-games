import LayoutPage from "./layout_page";
import { useContext, useState } from "react";
import { WebsocketContext } from "../context/websocket_context";
import { Navigate, useSearchParams } from "react-router-dom";

export default function JoinPage() {
	const { createWebsocket } = useContext(WebsocketContext);
	const [searchParams, _] = useSearchParams();

	if (!searchParams.has("id")) {
		return <Navigate to={"/"} />;
	}

	const id = searchParams.get("id") ?? "";
	const defaultName = searchParams.get("name") ?? "";
	const needsPassword = searchParams.has("needs_password");

	const [name, setName] = useState(defaultName);
	const [password, setPassword] = useState<undefined | string>(undefined);

	return <LayoutPage>
		<div className={"m-auto flex flex-col gap-4 p-8 bg-[#32006F] rounded-md rounded-xl border border-[#232323] gradient-reverse"}>
			<h3>Join a game</h3>
			<div>
				<label htmlFor={"name"}>Your name</label>
				<input defaultValue={name}
					className={"bg-[#32006F] border-[#232323] text-white"}
					onChange={(e) => setName(e.target.value)}
					id={"name"} />
			</div>
			{needsPassword ? (<div>
				<label htmlFor={"password"}>Password</label>
				<input defaultValue={password}
					className={"bg-[#32006F] border-[#232323] text-white"}
					type={"password"}
					onChange={(e) => setPassword(e.target.value)}
					id={"password"} />
			</div>) : null}
			<button disabled={name === "" || (needsPassword && password === "")}
				onClick={() => {
					createWebsocket({
						name: name,
						id: id,
						password: password,
					});
				}}
				className={"bg-lime-300 rounded-xl py-4 px-8 mx-auto mt-4 cursor-pointer disabled:bg-[#140033] disabled:cursor-default"}>Join game
			</button>
		</div>
	</LayoutPage>;
};