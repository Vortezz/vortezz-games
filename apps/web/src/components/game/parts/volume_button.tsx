import { useState } from "react";
import soundHigh from "../../../resources/icons/sound-high.svg";
import soundLow from "../../../resources/icons/sound-low.svg";
import soundMute from "../../../resources/icons/sound-mute.svg";

export function VolumeInput({ volume, setVolume }: {
	volume: number;
	setVolume: (volume: number) => void;
}) {
	const [isHover, setIsHover] = useState(false);
	let timer: number | undefined = undefined;

	let soundIcon: string;
	if (volume === 0) {
		soundIcon = soundMute;
	} else if (volume < 50) {
		soundIcon = soundLow;
	} else {
		soundIcon = soundHigh;
	}

	return <div className={"relative w-fit h-fit"}
		onMouseEnter={() => {
			clearTimeout(timer);
			setIsHover(true);
		}}
		onMouseLeave={() => {
			clearTimeout(timer);
			timer = setTimeout(() => setIsHover(false), 200);
		}}>
		<img className={"h-8 cursor-pointer"}
			alt={"🔊"}
			onClick={() => {
				if (volume > 0) {
					setVolume(0);
				} else {
					setVolume(50);
				}
			}}
			src={soundIcon} />
		<input className={`${isHover ? "" : "hidden"} absolute bottom-18 -left-8 -rotate-90 w-24`}
			type={"range"}
			min={0}
			max={100}
			value={volume}
			onChange={(e) => {
				setVolume(parseInt(e.target.value ?? "0", 10));
			}}
			step={5} />
	</div>;
}