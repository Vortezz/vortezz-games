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
		<option value={"en"}>English</option>
		<option value={"fr"}>French</option>
	</select>;
}