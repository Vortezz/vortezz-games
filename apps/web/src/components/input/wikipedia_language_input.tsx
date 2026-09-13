import { WIKI_LANGUAGES } from "@repo/shared/src/struct/game";

export function WikipediaLanguageInput({ value, setValue, disabled }: { value: string, setValue: (value: string) => void, disabled: boolean }) {
	return <select className={"relative w-full"}
		value={value}
		disabled={disabled}
		onClick={(e) => {
			const target = e.target as HTMLSelectElement;

			if (!target) {
				return;
			}

			setValue(target.value);
		}}>
		{WIKI_LANGUAGES.map((lang) => <option key={lang.id}
			value={lang.id}>{lang.name}</option>)}
	</select>;
}