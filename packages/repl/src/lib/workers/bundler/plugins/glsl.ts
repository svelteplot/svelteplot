import type { Plugin } from '@rollup/browser';

const plugin: Plugin = {
	name: 'glsl',
	transform: (code, id) => {
		if (!id.endsWith('.glsl')) return;

		return {
			code: `export default ${JSON.stringify(code)};`,
			map: null
		};
	}
};

export default plugin;
