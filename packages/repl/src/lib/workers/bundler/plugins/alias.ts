import { VIRTUAL } from '../../constants';
import type { File } from '$lib/Workspace.svelte';
import type { Plugin } from '@rollup/browser';

/**
 * Alias plugin for resolving import aliases (e.g., $lib -> src/lib).
 * This will also run on npm packages, so that e.g. SvelteKit libraries using $app/environment can also make use of this.
 *
 * @example
 * // With aliases: { '$lib': 'src/lib' }
 * // import foo from '$lib/foo' -> import foo from 'src/lib/foo'
 * // import bar from '$lib' -> import bar from 'src/lib'
 */
function alias_plugin(aliases: Record<string, string> = {}, virtual: Map<string, File>): Plugin {
	// Sort aliases by length (longest first) to avoid conflicts
	const alias_entries = Object.entries(aliases).sort((a, b) => b[0].length - a[0].length);

	return {
		name: 'alias',
		resolveId(importee, importer) {
			// Skip if no aliases configured / this is a relative import
			if (alias_entries.length === 0 || importee[0] === '.') {
				return null;
			}

			// Check if the import matches any alias
			for (const [alias_key, alias_path] of alias_entries) {
				if (importee === alias_key) {
					// Exact match - replace with alias path
					return resolve(virtual, `${VIRTUAL}/${alias_path}`, importer);
				} else if (importee.startsWith(alias_key + '/')) {
					// Partial match - replace the prefix
					const relative_path = importee.slice(alias_key.length + 1);
					return resolve(virtual, `${VIRTUAL}/${alias_path}/${relative_path}`, importer);
				}
			}

			// No alias match, let other plugins handle it
			return null;
		}
	};
}

/**
 * Tries to resolve the import path based on the virtual file map, trying different suffixes.
 */
export function resolve(virtual: Map<string, File>, importee: string, importer: string): string {
	const url = new URL(importee, importer);

	for (const suffix of ['', '.js', '.json', '.ts', '/index.js', '/index.ts']) {
		const with_suffix = `${url.href.slice(VIRTUAL.length + 1)}${suffix}`;
		const file = virtual.get(with_suffix);

		if (file) {
			return url.href + suffix;
		}
	}

	if (url.href.endsWith('.ts') || url.href.endsWith('.js')) {
		// One can mean the other (TS encourages you to import .ts files with .js suffixes, and bundlers handle these cases)
		const other_suffix = url.href.endsWith('.ts') ? '.js' : '.ts';
		const with_other_suffix = `${url.href.slice(VIRTUAL.length + 1, -3)}${other_suffix}`;
		const file = virtual.get(with_other_suffix);

		if (file) {
			return url.href.slice(0, -3) + other_suffix;
		}
	}

	throw new Error(
		`'${importee}' (imported by ${importer.replace(VIRTUAL + '/', '')}) does not exist`
	);
}

export default alias_plugin;
