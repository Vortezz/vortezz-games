import { Component } from "react";

interface TimerComponentProps {
	startedAt: number;
	finishedAt?: number;
}

export class TimerComponent extends Component<TimerComponentProps> {

	private readonly startedAt: number;
	private readonly finishedAt?: number;

	constructor(props: TimerComponentProps) {
		super(props);

		this.startedAt = props.startedAt;
		this.finishedAt = props.finishedAt;
	}

	public componentDidMount() {
		const interval = setInterval(() => {
			this.forceUpdate();
		}, 400);

		return () => clearInterval(interval);
	}

	public render() {
		let finishedAt = this.finishedAt;
		if (finishedAt === undefined) {
			finishedAt = Date.now();
		}

		const delta = Math.round((finishedAt - this.startedAt) / 1000);
		const hours = Math.floor(delta / 3600);
		const minutes = Math.floor(delta / 60);
		const seconds = delta % 60;

		let string = "";
		if (hours > 0) {
			string += `${hours}h`;
		}

		if (minutes > 0) {
			string += `${minutes}m`;
		}

		if (seconds > 0) {
			string += `${seconds}s`;
		}

		if (string === "") {
			string = "0s";
		}

		return <span>{string}</span>;
	}
}