import Navbar from "../components/section/navbar";
import { ReactNode } from "react";

export default function LayoutPage({ children }: { children: ReactNode }) {
	return <main className={"flex flex-col h-screen w-full justify-between"}>
		<Navbar />
		{children}
	</main>;
}