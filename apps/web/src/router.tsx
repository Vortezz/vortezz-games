import { createBrowserRouter } from "react-router-dom";
import HomePage from "./page/home_page";
import CreatePage from "./page/create_page";
import JoinPage from "./page/join_page";
import GamePage from "./page/game_page";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/create",
		element: <CreatePage />,
	},
	{
		path: "/join",
		element: <JoinPage />,
	},
	{
		path: "/game",
		element: <GamePage />,
	},
]);