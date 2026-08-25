import logo from "../../resources/logo.svg";
import { Link } from "react-router-dom";

export default function Navbar() {
	return <nav className={"flex justify-between w-full h-24"}>
		<img src={logo}
			alt={"Vortezz logo"}
			className={"h-16 w-16 ml-12 my-6"} />
		<div className={"flex mr-12 gap-8 my-auto"}>
			<Link to={"/"}
				className={"text-white text-xl font-bold"}>Home</Link>
			<div className={"text-white text-xl font-bold"}>Games</div>
		</div>
	</nav>;
}