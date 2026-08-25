import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { WebsocketProvider } from "./context/websocket_context_provider";
import { NotificationProvider } from "./context/notification_context_provider";

function App() {
	return <NotificationProvider>
		<WebsocketProvider>
			<RouterProvider router={router} />
		</WebsocketProvider>
	</NotificationProvider>;
}

createRoot(document.getElementById("app")!).render(<App />);
