import { useEffect, useRef, useState } from "react";

// TODO : Validation
export function WikipediaPageInput({ value, setValue, disabled, lang }: { value: string, setValue: (value: string) => void, disabled: boolean, lang: string }) {
	const ref = useRef<HTMLDivElement>(null);

	const [searchText, setSearchText] = useState<string>(value);
	const [choices, setChoices] = useState<string[]>([]);
	const [focused, setFocused] = useState<boolean>(false);

	useEffect(() => {
		if (searchText === "" || disabled) {
			return;
		}

		fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchText}&utf8=&format=json&origin=*&srlimit=5&srprop=title`)
			.then(response => response.json())
			.then(data => {
				setChoices(data.query.search.map((item: any) => item.title));
			});
	}, [searchText]);

	useEffect(() => {
		setSearchText(value);
	}, [value]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
				setFocused(false);
			}
		}

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [ref.current]);

	return <div className={"relative w-full"}
		ref={ref}
		onFocus={() => setFocused(true)}
		onClick={(e) => {
			const target = e.target as HTMLElement;

			if (!target || !target.className.includes("wikipedia-choice")) {
				return;
			}

			setSearchText(target.innerText);
			setValue(target.innerText);

			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
				setFocused(false);
			}
		}}>
		<input value={searchText}
			disabled={disabled}
			onChange={(e) => setSearchText(e.target.value)} />
		{choices.length > 0 && focused && <div className={"absolute z-10 w-full top-12 bg-black px-4 py-2 rounded-md flex flex-col gap-2"}>
			{choices.map(choice => <p className={"cursor-pointer wikipedia-choice"}>{choice}</p>)}
		</div>}
	</div>;
}