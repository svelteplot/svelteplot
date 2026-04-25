import type { Plugin } from '@rollup/browser';

function escape(str: string) {
	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function ensureFunction(functionOrValue: unknown) {
	if (typeof functionOrValue === 'function') {
		return functionOrValue;
	}
	return function () {
		return functionOrValue;
	};
}

function longest(a: string, b: string) {
	return b.length - a.length;
}

function mapToFunctions(object: Record<string, unknown>) {
	return Object.keys(object).reduce(function (functions: Record<string, Function>, key) {
		functions[key] = ensureFunction(object[key]);
		return functions;
	}, {});
}

function replace(options: Record<string, unknown>): Plugin {
	const functionValues = mapToFunctions(options);
	const keys = Object.keys(functionValues).sort(longest).map(escape);

	const pattern = new RegExp('\\b(' + keys.join('|') + ')\\b', 'g');

	return {
		name: 'replace',

		transform: function transform(code, id) {
			let hasReplacements = false;
			let match;
			let start;
			let end;
			let replacement;

			code = code.replace(pattern, (_, key) => {
				hasReplacements = true;
				return String(functionValues[key](id));
			});

			if (!hasReplacements) {
				return null;
			}

			return {
				code,
				map: null
			};
		}
	};
}

export default replace;
