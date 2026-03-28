import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
	entry: {
		index: "src/index.ts",
	},
	mainFields: ["module", "main"],
	clean: true,
	format: ["cjs"],
	external: ["ws"],
	dts: true,
	...options,
}));
