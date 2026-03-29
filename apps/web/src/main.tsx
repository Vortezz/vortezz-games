import { createRoot } from "react-dom/client";
import "./index.css";
import typescriptLogo from "/typescript.svg";
import { Counter, Header } from "@repo/ui";

const App = () => (
	<div className={"flex"}>
		<a href="https://vitejs.dev"
			target="_blank"
			className={"bg-red-500"}>
			<img src="/vite.svg"
				className="logo"
				alt="Vite logo" />
		</a>
		<a href="https://www.typescriptlang.org/"
			target="_blank">
			<img
				src={typescriptLogo}
				className="logo vanilla"
				alt="TypeScript logo"
			/>
		</a>
		<Header title="Web" />
		<div className="card">
			<Counter />
		</div>
	</div>
);

createRoot(document.getElementById("app")!).render(<App />);
