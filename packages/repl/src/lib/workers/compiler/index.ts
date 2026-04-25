import '@sveltejs/site-kit/polyfills';
import type { CompileResult } from 'svelte/compiler';
import type { ExposedCompilerOptions, File } from '../../Workspace.svelte';
import { load_svelte } from '../npm';
import { strip_types } from '../typescript-strip-types';

// hack for magic-string and Svelte 4 compiler
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

declare var self: Window & typeof globalThis & { svelte: typeof import('svelte/compiler') };

const cache: Record<string, Promise<any>> = {};

addEventListener('message', async (event) => {
	const { id, file, version, options } = event.data as {
		id: number;
		file: File;
		version: string;
		options: ExposedCompilerOptions;
	};

	cache[version] ??= load_svelte(version);
	cache[version].catch(() => {
		delete cache[version];
	});
	const { can_use_experimental_async, svelte } = await cache[version];

	if (!file.name.endsWith('.svelte') && !svelte.compileModule) {
		// .svelte.js file compiled with Svelte 3/4 compiler
		postMessage({
			id,
			filename: file.name,
			payload: {
				error: null,
				result: null,
				migration: null
			}
		});
		return;
	}

	let migration = null;

	if (svelte.migrate) {
		try {
			migration = svelte.migrate(file.contents, { filename: file.name });
		} catch (e) {
			// can this happen?
		}
	}

	try {
		let result: CompileResult;

		if (file.name.endsWith('.svelte')) {
			const is_svelte_3_or_4 = !svelte.compileModule;
			const compilerOptions: any = {
				generate: is_svelte_3_or_4
					? options.generate === 'client'
						? 'dom'
						: 'ssr'
					: options.generate,
				dev: options.dev,
				filename: file.name,
				fragments: options.fragments
			};

			if (!is_svelte_3_or_4) {
				compilerOptions.modernAst = options.modernAst; // else Svelte 3/4 will throw an "unknown option" error
			}

			if (can_use_experimental_async) {
				compilerOptions.experimental = { async: true };
			}

			if (compilerOptions.fragments == null) {
				// if fragments is not set it probably means we are using
				// a version that doesn't support it, so we need to remove it
				delete compilerOptions.fragments;
			}

			result = svelte.compile(file.contents, compilerOptions);
		} else {
			const compilerOptions: any = {
				generate: options.generate,
				dev: options.dev,
				filename: file.name
			};

			if (can_use_experimental_async) {
				compilerOptions.experimental = { async: true };
			}

			const content = file.basename.endsWith('.ts') ? strip_types(file.contents) : file.contents;
			result = svelte.compileModule(content, compilerOptions);
		}

		postMessage({
			id,
			filename: file.name,
			payload: {
				error: null,
				result: {
					metadata: { runes: false },
					...result,
					warnings: result.warnings.map((w) => {
						delete w.toString;
						return { message: w.message, ...w };
					})
				},
				migration
			}
		});
	} catch (e) {
		if (!e.position && e.loc) {
			// this came from tsBlankSpace. Workspace expects a
			// `position` property from a Svelte compile error;
			// this is a hacky but pragmatic way to solve it
			e.position = [e.pos, e.raisedAt];
		}

		postMessage({
			id,
			filename: file.name,
			payload: {
				error: { message: e.message, ...e },
				result: null,
				migration: null
			}
		});
	}
});
