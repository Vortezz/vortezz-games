const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CHARACTERS_LENGTH = CHARACTERS.length;

export function generateString(length: number): string {
	let result = "";

	for (let i = 0; i < length; i++) {
		result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS_LENGTH));
	}

	return result;
}