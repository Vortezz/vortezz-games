import Navbar from "../components/section/navbar";
import { ReactNode } from "react";

export default function LayoutPage({ children }: { children: ReactNode }) {
	return <main className={"flex flex-col h-screen w-full justify-between"}
		style={{
			background: "linear-gradient(270deg, #0E0023 0%, #140033 48.56%, #230058 100%)",
		}}>
		<Navbar />
		{children}
	</main>;
}