export default function Navbar() {
	return <nav className={"flex justify-between w-full h-fit"}>
		<div className={"px-8 py-4 bg-gray-200 rounded-md h-fit ml-12 my-6"}>LOGO</div>
		<div className={"flex mr-12 gap-8 my-auto"}>
			<div className={"text-white text-xl font-bold"}>Home</div>
			<div className={"text-white text-xl font-bold"}>Games</div>
		</div>
	</nav>;
}