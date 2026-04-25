import type { Plugin } from '@rollup/browser';

const plugin: Plugin = {
	name: 'mp3',
	transform: (code, id) => {
		if (!id.endsWith('.mp3')) return;

		return {
			code: `export default "data:audio/mp3;base64,${code}";`,
			map: null
		};
	}
};

export default plugin;
