import '@sveltejs/site-kit/polyfills';
import { walk } from 'zimmerframe';
import '../patch_window';
import { rollup } from '@rollup/browser';
import { DEV } from 'esm-env';
import typescript_strip_types from './plugins/typescript';
import commonjs from './plugins/commonjs';
import glsl from './plugins/glsl';
import json from './plugins/json';
import csv from './plugins/csv';
import mp3 from './plugins/mp3';
import image from './plugins/image';
import svg from './plugins/svg';
import replace from './plugins/replace';
import loop_protect from './plugins/loop-protect';
import alias_plugin, { resolve } from './plugins/alias';
import type { Plugin, RollupCache, TransformResult } from '@rollup/browser';
import type { BundleMessageData, BundleOptions } from '../workers';
import type { Warning } from '../../types';
import type { CompileError, CompileResult } from 'svelte/compiler';
import type { File } from '../../Workspace.svelte';
import type { Node } from 'estree';
import { max } from './semver';
import { NPM, VIRTUAL } from '../constants';
import {
	normalize_path,
	fetch_package,
	load_svelte,
	parse_npm_url,
	resolve_local,
	resolve_subpath,
	resolve_version,
	type Package
} from '../npm';
import type { BundleResult } from '$lib/public';

// hack for magic-string and rollup inline sourcemaps
// do not put this into a separate module and import it, would be treeshaken in prod
self.window = self;

const ENTRYPOINT = '__entry.js';
const WRAPPER = '__wrapper.svelte';
const STYLES = '__styles.js';
const ESM_ENV = '__esm-env.js';

let current_id: number;

self.addEventListener('message', async (event: MessageEvent<BundleMessageData>) => {
	switch (event.data.type) {
		case 'init': {
			get_svelte(event.data.svelte_version);
			break;
		}

		case 'bundle': {
			try {
				const { uid, files, options } = event.data;
				const {
					svelte,
					version: svelte_version,
					can_use_experimental_async
				} = await get_svelte(options.svelte_version);

				current_id = uid;

				setTimeout(async () => {
					if (current_id !== uid) return;

					const use_async = can_use_experimental_async && options.async;

					const result = await bundle(svelte, svelte_version, uid, files, options, use_async);

					console.log('[bundle worker result]', result);

					// error object might be augmented, see https://github.com/rollup/rollup/blob/76a3b8ede4729a71eb522fc29f7d550a4358827b/docs/plugin-development/index.md#thiserror,
					// hence only check that the specific abort property we set is there
					if ((result.error as any)?.svelte_bundler_aborted === ABORT.svelte_bundler_aborted) {
						return;
					}
					if (result && uid === current_id) postMessage(result);
				});
			} catch (e) {
				self.postMessage({
					type: 'error',
					uid: event.data.uid,
					message: `Error loading the compiler: ${(e as Error).message}`
				});
			}

			break;
		}
	}
});

let ready: ReturnType<typeof load_svelte>;
let ready_version: string;

function get_svelte(svelte_version: string) {
	if (ready_version === svelte_version) return ready;

	self.postMessage({ type: 'status', message: `fetching svelte@${svelte_version}` });
	ready_version = svelte_version;
	ready = load_svelte(svelte_version || 'latest');
	ready.then(({ version, can_use_experimental_async }) => {
		ready_version = version;
		self.postMessage({
			type: 'version',
			version,
			supports_async: can_use_experimental_async
		});
	});
	return ready;
}

const ABORT = { svelte_bundler_aborted: true };

let previous: {
	key: string;
	cache: RollupCache | undefined;
	/** Needed because if rollup cache hits then we won't be able to pick up all candidates in subsequent runs */
	tailwind_candidates: Set<string>;
};

let tailwind: Awaited<ReturnType<typeof init_tailwind>>;

async function init_tailwind(user_css = '') {
	const tailwindcss = await import('tailwindcss');

	const { default: tailwind_preflight } = await import('tailwindcss/preflight.css?raw');
	const { default: tailwind_theme } = await import('tailwindcss/theme.css?raw');
	const { default: tailwind_utilities } = await import('tailwindcss/utilities.css?raw');

	const tailwind_files: Record<string, string> = {
		'tailwindcss/theme.css': tailwind_theme,
		'tailwindcss/preflight.css': tailwind_preflight,
		'tailwindcss/utilities.css': tailwind_utilities
	};

	const tailwind_base = [
		`@layer theme, base, components, utilities;`,
		`@import "tailwindcss/theme.css" layer(theme);`,
		`@import "tailwindcss/preflight.css" layer(base);`,
		`@import "tailwindcss/utilities.css" layer(utilities);`,
		user_css
	].join('\n');

	return await tailwindcss.compile(tailwind_base, {
		loadStylesheet: async (id, base) => {
			return { content: tailwind_files[id], base, path: '' };
		}
	});
}

async function get_bundle(
	svelte: typeof import('svelte/compiler'),
	svelte_version: string,
	uid: number,
	mode: 'client' | 'server',
	virtual: Map<string, File>,
	options: BundleOptions,
	can_use_experimental_async: boolean
) {
	let bundle;

	const key = JSON.stringify(options);
	/** A set of package names (without subpaths) to include in pkg.devDependencies when downloading an app */
	const imports: Set<string> = new Set();
	const warnings: Warning[] = [];
	const all_warnings: Array<{ message: string }> = [];

	const tailwind_candidates =
		previous?.key === key ? previous.tailwind_candidates : new Set<string>();

	function add_tailwind_candidates(ast: Node | undefined) {
		if (!ast) return;

		walk(ast, null, {
			ImportDeclaration() {
				// don't descend into these nodes, so that we don't
				// pick up import sources
			},
			Literal(node) {
				if (typeof node.value === 'string' && node.value) {
					for (const candidate of node.value.split(' ')) {
						if (candidate) tailwind_candidates.add(candidate);
					}
				}
			},
			TemplateElement(node) {
				if (node.value.raw) {
					for (const candidate of node.value.raw.split(' ')) {
						if (candidate) tailwind_candidates.add(candidate);
					}
				}
			}
		});
	}

	const repl_plugin: Plugin = {
		name: 'svelte-repl',
		async resolveId(importee, importer) {
			if (uid !== current_id) throw ABORT;

			// entrypoint
			if (!importer) return `${VIRTUAL}/${ENTRYPOINT}`;

			// special case
			if (importee === 'esm-env') return `${VIRTUAL}/${ESM_ENV}`;

			// importing from a URL
			if (/^[a-z]+:/.test(importee)) return importee;

			// importing an absolute path (e.g. /data/penguins.csv) — resolve against the origin
			if (importee[0] === '/') {
				return self.location.origin + importee;
			}

			/** The npm package we're importing from, if any */
			let current: null | Package;

			if (importer.startsWith(NPM)) {
				const { name, version } = parse_npm_url(importer);
				current = await fetch_package(name, name === 'svelte' ? svelte_version : version);
			}

			// importing a relative file
			if (importee[0] === '.') {
				if (importer.startsWith(VIRTUAL)) {
					return resolve(virtual, importee, importer);
				}

				if (current) {
					const { name, version } = current.meta;
					const path = new URL(importee, importer).href.replace(`${NPM}/${name}@${version}/`, '');

					return normalize_path(current, path, importee, importer);
				}

				return new URL(importee, importer).href;
			}

			// importing a file from the same package via pkg.imports
			if (importee[0] === '#') {
				if (current) {
					const subpath = resolve_subpath(current, importee);
					return normalize_path(current, subpath.slice(2), importee, importer);
				}
				return await resolve_local(importee);
			}

			// importing an external package -> `npm://$/<name>@<version>/<path>`
			const match = /^((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?(\/.+)?$/.exec(importee);
			if (!match) throw new Error(`Invalid import "${importee}"`);

			const pkg_name = match[1];

			if (pkg_name === 'svelte' && svelte_version === 'local') {
				return await resolve_local(importee);
			}

			let default_version = 'latest';

			if (current) {
				// use the version specified in importer's package.json, not `latest`
				const { meta } = current;

				if (meta.name === pkg_name) {
					default_version = meta.version;
				} else {
					default_version = max(
						meta.devDependencies?.[pkg_name] ??
							meta.peerDependencies?.[pkg_name] ??
							meta.dependencies?.[pkg_name]
					);
				}
			}

			if (importer.startsWith(VIRTUAL)) {
				// if this was imported by one of our files, add it to the `imports` set
				imports.add(pkg_name);
			}

			const v = await resolve_version(match[1], match[2] ?? default_version);
			const pkg = await fetch_package(pkg_name, pkg_name === 'svelte' ? svelte_version : v);
			const subpath = resolve_subpath(pkg, '.' + (match[3] ?? ''));

			return normalize_path(pkg, subpath.slice(2), importee, importer);
		},
		async load(resolved) {
			if (uid !== current_id) throw ABORT;

			if (resolved.startsWith(VIRTUAL)) {
				const file = virtual.get(resolved.slice(VIRTUAL.length + 1))!;
				return file.contents;
			}

			if (resolved.startsWith(NPM)) {
				let [, name, v, subpath] = /^npm:\/\/\$\/((?:@[^/]+\/)?[^/@]+)(?:@([^/]+))?\/(.+)$/.exec(
					resolved
				)!;

				const pkg = await fetch_package(name, name === 'svelte' ? svelte_version : v);

				const file = pkg.contents[subpath];
				if (file) return file.text;
			}

			const response = await fetch(resolved);
			if (response.ok) return response.text();

			throw new Error(`Could not load ${resolved}`);
		},
		transform(code, id) {
			if (uid !== current_id) throw ABORT;

			const name = id.replace(VIRTUAL + '/', '').replace(NPM + '/', '');

			self.postMessage({ type: 'status', message: `bundling ${name}` });

			if (!/\.(svelte|js|ts)$/.test(id)) return null;

			let result: CompileResult;

			if (id.endsWith('.svelte')) {
				const is_gt_5 = Number(svelte.VERSION.split('.')[0]) >= 5;

				const compilerOptions: any = {
					filename: name,
					generate: is_gt_5 ? 'client' : 'dom',
					dev: true,
					fragments: options.fragments
				};

				if (is_gt_5) {
					compilerOptions.runes = options.runes;
				}

				if (can_use_experimental_async) {
					compilerOptions.experimental = { async: true };
				}

				if (compilerOptions.fragments == null) {
					// if fragments is not set it probably means we are using
					// a version that doesn't support it, so we need to remove it
					delete compilerOptions.fragments;
				}

				result = svelte.compile(code, compilerOptions);

				walk(result.ast.html as import('svelte/compiler').AST.TemplateNode, null, {
					Attribute(node) {
						if (Array.isArray(node.value)) {
							for (const chunk of node.value) {
								if (chunk.type === 'Text') {
									for (const candidate of chunk.data.split(' ')) {
										if (candidate) tailwind_candidates.add(candidate);
									}
								}
							}
						}
					}
				});

				add_tailwind_candidates(result.ast.module);
				add_tailwind_candidates(result.ast.instance);
				add_tailwind_candidates(result.ast.html);

				if (result.css?.code) {
					// resolve local files by inlining them
					result.css.code = result.css.code.replace(
						/url\(['"]?\.\/(.+?\.(svg|webp|png))['"]?\)/g,
						(match, $1, $2) => {
							if (virtual.has($1)) {
								if ($2 === 'svg') {
									return `url('data:image/svg+xml;base64,${btoa(virtual.get($1)!.contents)}')`;
								} else {
									return `url('data:image/${$2};base64,${virtual.get($1)!.contents}')`;
								}
							} else {
								return match;
							}
						}
					);
					// add the CSS via injecting a style tag
					result.js.code +=
						'\n\n' +
						`
					import { styles as $$_styles } from '${VIRTUAL}/${STYLES}';
					const $$__style = document.createElement('style');
					$$__style.textContent = ${JSON.stringify(result.css.code)};
					document.head.append($$__style);
					$$_styles.push($$__style);
				`.replace(/\t/g, '');
				}
			} else if (/\.svelte\.(js|ts)$/.test(id)) {
				const compilerOptions: any = {
					filename: name,
					generate: 'client',
					dev: true
				};

				if (can_use_experimental_async) {
					compilerOptions.experimental = { async: true };
				}

				result = svelte.compileModule?.(code, compilerOptions);

				if (!result) {
					return null;
				}
			} else {
				return null;
			}

			// @ts-expect-error
			(result.warnings || result.stats?.warnings)?.forEach((warning) => {
				// This is required, otherwise postMessage won't work
				// @ts-ignore
				delete warning.toString;
				// TODO remove stats post-launch
				// @ts-ignore
				warnings.push(warning);
			});

			const transform_result: TransformResult = {
				code: result.js.code,
				map: result.js.map
			};

			return transform_result;
		}
	};

	const handled_css_ids = new Set<string>();
	let user_css = '';

	bundle = await rollup({
		input: './__entry.js',
		cache: previous?.key === key ? previous.cache : true,
		plugins: [
			alias_plugin(options.aliases, virtual),
			typescript_strip_types,
			repl_plugin,
			commonjs,
			json,
			csv,
			svg,
			mp3,
			image,
			glsl,
			loop_protect,
			replace({
				'process.env.NODE_ENV': JSON.stringify('production')
			}),
			{
				name: 'css',
				transform(code, id) {
					if (id.endsWith('.css')) {
						if (!handled_css_ids.has(id)) {
							handled_css_ids.add(id);
							// We don't handle imports in the user CSS right now, so we remove them
							// to avoid errors in e.g. the Tailwind compiler
							user_css += '\n' + code.replace(/@import\s+["'][^"']+["'][^;]*;/g, '');
						}
						return {
							code: '',
							map: null
						};
					}
				}
			},
			options.tailwind && {
				name: 'tailwind-extract',
				transform(code, id) {
					// TODO tidy this up
					if (id.startsWith(`${NPM}/svelte@`)) return;
					if (id.startsWith(`${NPM}/clsx@`)) return;
					if (id === `${VIRTUAL}/${ENTRYPOINT}`) return;
					if (id === `${VIRTUAL}/${STYLES}`) return;
					if (id === `${VIRTUAL}/${ESM_ENV}`) return;
					if (id.endsWith('.svelte')) return;

					try {
						// Don't let a parser/tailwind error crash the bundler
						// Can happen for files that begin with a bash shebang
						add_tailwind_candidates(this.parse(code));
					} catch {}
				}
			}
		],
		onwarn(warning) {
			all_warnings.push({
				message: warning.message
			});
		}
	});

	previous = { key, cache: bundle.cache, tailwind_candidates };

	return {
		bundle,
		css: options.tailwind
			? (tailwind ?? (await init_tailwind(user_css))).build([...tailwind_candidates])
			: user_css
				? user_css
				: null,
		imports: Array.from(imports),
		error: null,
		warnings,
		all_warnings
	};
}

async function bundle(
	svelte: typeof import('svelte/compiler'),
	svelte_version: string,
	uid: number,
	files: File[],
	options: BundleOptions,
	can_use_experimental_async: boolean
): Promise<BundleResult> {
	if (!DEV) {
		console.log(`running Svelte compiler version %c${svelte.VERSION}`, 'font-weight: bold');
	}

	const lookup: Map<string, File> = new Map();

	lookup.set(ENTRYPOINT, {
		type: 'file',
		name: ENTRYPOINT,
		basename: ENTRYPOINT,
		contents:
			svelte.VERSION.split('.')[0] >= '5'
				? `
			import { unmount as u } from 'svelte';
			import { styles } from '${VIRTUAL}/${STYLES}';
			export { mount, untrack } from 'svelte';
			export { default as App } from '${VIRTUAL}/${WRAPPER}';
			export function unmount(component) {
				u(component);
				styles.forEach(style => style.remove());
			}
		`
				: `
			import { styles } from '${VIRTUAL}/${STYLES}';
			export { default as App } from './App.svelte';
			export function mount(component, options) {
				return new component(options);
			}
			export function unmount(component) {
				component.$destroy();
				styles.forEach(style => style.remove());
			}
			export function untrack(fn) {
				return fn();
			}
		`,
		text: true
	});

	const wrapper = can_use_experimental_async
		? `
		<script>
			import App from './App.svelte';
		</script>

		<svelte:boundary>
			<App />

			{#snippet pending()}{/snippet}
		</svelte:boundary>
	`
		: `
		<script>
			import App from './App.svelte';
		</script>

		<App />
	`;

	lookup.set(WRAPPER, {
		type: 'file',
		name: WRAPPER,
		basename: WRAPPER,
		contents: wrapper,
		text: true
	});

	lookup.set(STYLES, {
		type: 'file',
		name: STYLES,
		basename: STYLES,
		contents: `
			export let styles = [];
		`,
		text: true
	});

	lookup.set(ESM_ENV, {
		type: 'file',
		name: STYLES,
		basename: STYLES,
		contents: `
			export const BROWSER = true;
			export const DEV = true;
		`,
		text: true
	});

	files.forEach((file) => {
		lookup.set(file.name, file);
	});

	try {
		let client: Awaited<ReturnType<typeof get_bundle>> = await get_bundle(
			svelte,
			svelte_version,
			uid,
			'client',
			lookup,
			options,
			can_use_experimental_async
		);

		const client_result = (
			await client.bundle?.generate({
				format: 'iife',
				exports: 'named',
				inlineDynamicImports: true
				// sourcemap: 'inline'
			})
		)?.output[0];

		const server = false // TODO how can we do SSR?
			? await get_bundle(
					svelte,
					svelte_version,
					uid,
					'server',
					lookup,
					options,
					can_use_experimental_async
				)
			: null;

		const server_result = server
			? (
					await server.bundle?.generate({
						format: 'iife',
						name: 'SvelteComponent',
						exports: 'named'
						// sourcemap: 'inline'
					})
				)?.output?.[0]
			: null;

		return {
			uid,
			error: null,
			client: client_result,
			server: server_result,
			css: client.css,
			imports: client.imports
		};
	} catch (err) {
		console.error(err);

		const e = err as CompileError; // TODO could be a non-Svelte error?

		return {
			uid,
			error: { ...e, message: e.message }, // not all Svelte versions return an enumerable message property
			client: null,
			server: null,
			css: null,
			imports: null
		};
	}
}
