import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { WebsocketProvider } from "./context/websocket_context";
import { router } from "./router";

function App() {
	return <WebsocketProvider>
		<RouterProvider router={router} />
	</WebsocketProvider>;
}

createRoot(document.getElementById("app")!).render(<App />);
