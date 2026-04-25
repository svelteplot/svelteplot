import { strip_types } from '../../typescript-strip-types';
import type { Plugin } from '@rollup/browser';

const plugin: Plugin = {
	name: 'typescript-strip-types',
	transform: (code, id) => {
		const match = id.endsWith('.ts');
		if (!match) return;

		return {
			code: strip_types(code)
		};
	}
};

export default plugin;
