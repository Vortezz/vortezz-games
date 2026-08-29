export type OverviewContent = {
	description: string;
	image: string;
};

function padText(str: string, amount: number) {
	if (str.length < amount) {
		return str;
	}

	return `${str.slice(0, amount)}...`;
}

export function WikipediaOverview({ content }: {
	content: OverviewContent | undefined | null
}) {
	if (content === null) {
		return <></>;
	}

	let contentElement;
	if (content === undefined) {
		contentElement = <>
			<p>Loading...</p>
		</>;
	} else {
		contentElement = <>
			<img src={content?.image}
				alt={"Thumbnail"}
				className={"max-h-40 max-w-40"} />
			<p>{padText(content?.description ?? "", 300)}</p>
		</>;
	}

	return <div className={"absolute bg-white px-6 max-w-120 py-4 flex flex-col items-center border border-gray-300 rounded-md shadow-xl gap-4 z-5 w-120"}
		style={{
			top: `20px`,
			left: `50%`,
			transform: "translate(-50%, 0)",
		}}>
		{contentElement}
	</div>;
}