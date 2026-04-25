import type { CompileError, CompileResult } from 'svelte/compiler';
import { Compartment, EditorState, StateEffect, StateField } from '@codemirror/state';
import { compile_file } from './Compiler';
import { BROWSER } from 'esm-env';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { svelte } from '@replit/codemirror-lang-svelte';
import { autocomplete_for_svelte } from '@sveltejs/site-kit/codemirror';
import { Decoration, keymap, type DecorationSet } from '@codemirror/view';
import { acceptCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { theme } from './theme';
import { untrack } from 'svelte';
import type { Diagnostic } from '@codemirror/lint';

export interface File {
	type: 'file';
	name: string;
	basename: string;
	contents: string;
	text: boolean;
}

export interface Directory {
	type: 'directory';
	name: string;
	basename: string;
}

export type Item = File | Directory;

export interface Compiled {
	error: CompileError | null;
	result: CompileResult | null;
	migration: {
		code: string;
	} | null;
}

function is_file(item: Item): item is File {
	return item.type === 'file';
}

function is_svelte_file(file: File) {
	return /\.svelte(\.|$)/.test(file.name);
}

function file_type(file: Item) {
	return file.name.split('.').pop();
}

const set_highlight = StateEffect.define<{ start: number; end: number } | null>();

const highlight_field = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		// Apply the effect
		for (let effect of tr.effects) {
			if (effect.is(set_highlight)) {
				if (effect.value) {
					const { start, end } = effect.value;
					const deco = Decoration.mark({ class: 'highlight' }).range(start, end);
					return Decoration.set([deco]);
				} else {
					// Clear highlight
					return Decoration.none;
				}
			}
		}
		// Map decorations for document changes
		return highlights.map(tr.changes);
	},
	provide: (field) => EditorView.decorations.from(field)
});

const tab_behaviour = new Compartment();
const vim_mode = new Compartment();

const default_extensions = [
	basicSetup,
	EditorState.tabSize.of(2),
	tab_behaviour.of(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
	indentUnit.of('\t'),
	theme,
	vim_mode.of([]),
	highlight_field
];

export interface ExposedCompilerOptions {
	generate: 'client' | 'server';
	dev: boolean;
	modernAst: boolean;
	fragments: 'html' | 'tree' | undefined;
	async: boolean;
}

export class Workspace {
	// TODO this stuff should all be readonly
	creating = $state.raw<{ parent: string; type: 'file' | 'directory' } | null>(null);
	modified = $state<Record<string, boolean>>({});

	#compiler_options = $state.raw<ExposedCompilerOptions>({
		generate: 'client',
		dev: false,
		modernAst: true,
		// default to undefined so it's removed if the current version
		// doesn't support it
		fragments: undefined,
		async: true
	});
	compiled = $state<Record<string, Compiled>>({});

	#svelte_version = $state('');
	#readonly = false; // TODO do we need workspaces for readonly stuff?
	#files = $state.raw<Item[]>([]);
	#current = $state.raw() as File;
	#vim = $state(false);
	#aliases = $state.raw(undefined) as undefined | Record<string, string>;
	#tailwind = $state(false);
	supports_async = $state(true);

	#handlers = {
		hover: new Set<(pos: number | null) => void>(),
		select: new Set<(from: number, to: number) => void>()
	};

	#onupdate: (file: File) => void;
	#onreset: (items: Item[]) => void | Promise<void>;

	// CodeMirror stuff
	states = new Map<string, EditorState>();
	#view: EditorView | null = null;

	diagnostics = $derived.by(() => {
		const diagnostics: Diagnostic[] = [];

		const error = this.current_compiled?.error;
		const warnings = this.current_compiled?.result?.warnings ?? [];

		if (error) {
			diagnostics.push({
				severity: 'error',
				from: error.position![0],
				to: error.position![1],
				message: error.message,
				renderMessage: () => {
					let html = error.message
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/`(.+?)`/g, `<code>$1</code>`);

					if (error.code) {
						html += ` (<a href="/docs/svelte/compiler-errors#${error.code}">${error.code}</a>)`;
					}

					const span = document.createElement('span');
					span.innerHTML = html;

					return span;
				}
			});
		}

		for (const warning of warnings) {
			diagnostics.push({
				severity: 'warning',
				from: warning.start!.character,
				to: warning.end!.character,
				message: warning.message,
				renderMessage: () => {
					const span = document.createElement('span');
					span.innerHTML = `${warning.message
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(
							/`(.+?)`/g,
							`<code>$1</code>`
						)} (<a href="/docs/svelte/compiler-warnings#${warning.code}">${warning.code}</a>)`;

					return span;
				}
			});
		}

		return diagnostics;
	});

	constructor(
		files: Item[],
		{
			svelte_version = 'latest',
			initial,
			readonly = false,
			onupdate,
			onreset
		}: {
			svelte_version?: string;
			initial?: string;
			readonly?: boolean;
			onupdate?: (file: File) => void;
			onreset?: (items: Item[]) => void | Promise<void>;
		} = {}
	) {
		this.#svelte_version = svelte_version;
		this.#readonly = readonly;

		this.set(files, initial);

		this.#onupdate = onupdate ?? (() => {});
		this.#onreset = onreset ?? (() => {});

		this.#reset_diagnostics();
	}

	get files() {
		return this.#files;
	}

	get compiler_options() {
		return this.#compiler_options;
	}

	get current() {
		return this.#current;
	}

	get current_compiled() {
		if (this.#current.name in this.compiled) {
			return this.compiled[this.#current.name];
		}

		return null;
	}

	add(item: Item) {
		this.#create_directories(item);
		this.#files = this.#files.concat(item);

		if (is_file(item)) {
			this.#select(item);
			this.#onreset?.(this.#files);

			this.modified[item.name] = true;
		}

		return item;
	}

	disable_tab_indent() {
		this.#view?.dispatch({
			effects: tab_behaviour.reconfigure(keymap.of([{ key: 'Tab', run: acceptCompletion }]))
		});
	}

	enable_tab_indent() {
		this.#view?.dispatch({
			effects: tab_behaviour.reconfigure(
				keymap.of([{ key: 'Tab', run: acceptCompletion }, indentWithTab])
			)
		});
	}

	focus() {
		setTimeout(() => {
			this.#view?.focus();
		});
	}

	highlight_range(node: { start: number; end: number } | null, scroll = false) {
		if (!this.#view) return;

		const effects: StateEffect<any>[] = [set_highlight.of(node)];

		if (scroll && node) {
			effects.push(EditorView.scrollIntoView(node.start, { y: 'center' }));
		}

		this.#view.dispatch({
			effects
		});
	}

	mark_saved() {
		this.modified = {};
	}

	async link(view: EditorView) {
		if (this.#view) throw new Error('view is already linked');
		this.#view = view;

		untrack(() => {
			view.setState(this.#get_state(untrack(() => this.#current)));
			this.vim = localStorage.getItem('vim') === 'true';
		});
	}

	move(from: Item, to: Item) {
		const from_index = this.#files.indexOf(from);
		const to_index = this.#files.indexOf(to);

		this.#files.splice(from_index, 1);

		this.#files = this.#files.slice(0, to_index).concat(from).concat(this.#files.slice(to_index));
	}

	onhover(fn: (pos: number | null) => void) {
		$effect(() => {
			this.#handlers.hover.add(fn);

			return () => {
				this.#handlers.hover.delete(fn);
			};
		});
	}

	onselect(fn: (from: number, to: number) => void) {
		$effect(() => {
			this.#handlers.select.add(fn);

			return () => {
				this.#handlers.select.delete(fn);
			};
		});
	}

	remove(item: Item) {
		const index = this.#files.indexOf(item);

		if (index === -1) {
			throw new Error('Tried to remove a file that does not exist in the workspace');
		}

		let next = this.#current;

		if (next === item) {
			const file =
				this.#files.slice(0, index).findLast(is_file) ?? this.#files.slice(index + 1).find(is_file);

			if (!file) {
				throw new Error('Cannot delete the only file');
			}

			next = file;
		}

		this.#files = this.#files.filter((f) => {
			if (f === item) return false;
			if (f.name.startsWith(item.name + '/')) return false;
			return true;
		});

		this.#select(next);

		this.#onreset?.(this.#files);
	}

	rename(previous: Item, name: string) {
		const index = this.files.indexOf(previous);
		const was_current = previous === this.#current;

		const state = this.states.get(previous.name);
		this.states.delete(previous.name);

		const new_item: Item = {
			...previous,
			name,
			basename: name.split('/').pop()!
		};

		this.#create_directories(new_item);

		this.#files = this.#files.map((item, i) => {
			if (i === index) return new_item;

			if (previous.type === 'directory' && item.name.startsWith(previous.name + '/')) {
				return {
					...item,
					name: item.name.replace(previous.name, name)
				};
			}

			return item;
		});

		// preserve state, unless the language changed (in which case
		// it's simpler to just create a new editor state)
		if (state && file_type(previous) === file_type(new_item)) {
			this.states.set(name, state);
		}

		if (was_current) {
			this.#select(new_item as File);
		}

		if (this.modified[previous.name]) {
			delete this.modified[previous.name];
			this.modified[name] = true;
		}

		this.#onreset?.(this.#files);
	}

	reset(
		new_files: Item[],
		options: { tailwind: boolean; aliases?: Record<string, string> },
		selected?: string
	) {
		this.states.clear();
		this.#tailwind = options.tailwind;
		this.#aliases = options.aliases;

		const bundle = this.set(new_files, selected);

		this.mark_saved();

		const diagnostics = this.#reset_diagnostics();

		return Promise.all([bundle, diagnostics])
			.then(() => {})
			.catch(() => {});
	}

	select(name: string) {
		const file = this.#files.find((file) => is_file(file) && file.name === name);

		if (!file) {
			throw new Error(`File ${name} does not exist in workspace`);
		}

		this.#select(file as File);
	}

	set(files: Item[], selected = this.#current?.name) {
		const first = files.find(is_file);

		if (!first) {
			throw new Error('Workspace must have at least one file');
		}

		const matching_file = selected && files.find((file) => is_file(file) && file.name === selected);
		if (matching_file) {
			this.#select(matching_file as File);
		} else {
			this.#select(first);
		}

		this.#files = files;

		for (const [name, state] of this.states) {
			const file = files.find((file) => file.name === name) as File;

			if (file) {
				this.#update_state(file, state);
			} else {
				this.states.delete(name);
			}
		}

		return this.#onreset?.(this.files);
	}

	unlink(view: EditorView) {
		if (this.#view !== view) throw new Error('Wrong editor view');
		this.#view = null;
	}

	update_compiler_options(options: Partial<ExposedCompilerOptions>) {
		this.#compiler_options = { ...this.#compiler_options, ...options };
		this.#reset_diagnostics();
		for (let file of this.#files) {
			if (is_file(file)) {
				this.#onupdate(file);
			}
		}
	}

	update_file(file: File) {
		this.#update_file(file);

		const state = this.states.get(file.name);
		if (state) {
			this.#update_state(file, state);
		}
	}

	get aliases() {
		return this.#aliases;
	}

	set aliases(value) {
		this.#aliases = value;
		this.#onupdate(this.#current);
	}

	get tailwind() {
		return this.#tailwind;
	}

	set tailwind(value) {
		this.#tailwind = value;
		this.#onupdate(this.#current);
	}

	get svelte_version() {
		return this.#svelte_version;
	}

	set_svelte_version(value: string, notify = false) {
		this.#svelte_version = value;
		if (notify) {
			this.#update_file(this.#current);
			this.#reset_diagnostics();
		}
	}

	get vim() {
		return this.#vim;
	}

	set vim(value) {
		this.#toggle_vim(value);
	}

	async #toggle_vim(value: boolean) {
		this.#vim = value;

		localStorage.setItem('vim', String(value));

		// @ts-ignore jfc CodeMirror is a struggle
		let vim_extension_index = default_extensions.findIndex((ext) => ext.compartment === vim_mode);

		let extension: any = [];

		if (value) {
			const { vim } = await import('@replit/codemirror-vim');
			extension = vim();
		}

		default_extensions[vim_extension_index] = vim_mode.of(extension);

		this.#view?.dispatch({
			effects: vim_mode.reconfigure(extension)
		});

		// update all the other states
		for (const file of this.#files) {
			if (file.type !== 'file') continue;
			if (file === this.#current) continue;

			this.states.set(file.name, this.#create_state(file));
		}
	}

	#create_directories(item: Item) {
		// create intermediate directories as necessary
		const parts = item.name.split('/');

		while (parts.length > 1) {
			parts.pop();
			const joined = parts.join('/');

			if (this.files.find((file) => file.name === joined)) {
				return;
			}

			this.#files.push({
				type: 'directory',
				name: joined,
				basename: joined.split('/').pop()! // TODO get rid of this basename nonsense, it's infuriating
			});
		}
	}

	#get_state(file: File) {
		return this.states.get(file.name) ?? this.#create_state(file);
	}

	#create_state(file: File) {
		const extensions = [
			...default_extensions,
			EditorState.readOnly.of(this.#readonly),
			EditorView.editable.of(!this.#readonly),
			EditorView.updateListener.of((update) => {
				const state = this.#view!.state!;

				if (update.docChanged) {
					this.#update_file({
						...this.#current,
						contents: state.doc.toString()
					});

					// preserve undo/redo across files
					this.states.set(this.#current.name, state);
				}

				if (update.selectionSet) {
					if (state.selection.ranges.length === 1) {
						for (const handler of this.#handlers.select) {
							const { from, to } = state.selection.ranges[0];
							handler(from, to);
						}
					}
				}
			}),
			EditorView.domEventObservers({
				mousemove: (event, view) => {
					const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });

					if (pos !== null) {
						for (const handler of this.#handlers.hover) {
							handler(pos);
						}
					}
				},
				mouseleave: (event, view) => {
					for (const handler of this.#handlers.hover) {
						handler(null);
					}
				}
			})
		];

		switch (file_type(file)) {
			case 'js': // TODO autocomplete, including runes
			case 'json':
				extensions.push(javascript());
				break;

			case 'ts':
				extensions.push(javascript({ typescript: true }));
				break;

			case 'html':
				extensions.push(html());
				break;

			case 'svelte':
				extensions.push(
					svelte(),
					...autocomplete_for_svelte(
						() => this.current.name,
						() =>
							this.files
								.filter((file) => {
									if (file.type !== 'file') return false;
									// TODO put autocomplete_filter on the workspace
									// return autocomplete_filter(file);
									return true;
								})
								.map((file) => file.name)
					)
				);
				break;
		}

		const state = EditorState.create({
			doc: file.contents,
			extensions
		});

		this.states.set(file.name, state);

		return state;
	}

	#reset_diagnostics() {
		if (!BROWSER) return;

		const keys = Object.keys(this.compiled);
		const seen: string[] = [];

		let files = this.#files;

		// prioritise selected file
		if (this.current) {
			const i = this.#files.indexOf(this.current!);
			files = [this.current, ...this.#files.slice(0, i), ...this.#files.slice(i + 1)];
		}

		const done = files.map((file) => {
			if (file.type !== 'file') return;
			if (!is_svelte_file(file)) return;

			seen.push(file.name);

			return compile_file(file, this.#svelte_version, this.compiler_options).then((compiled) => {
				this.compiled[file.name] = compiled;
			});
		});

		for (const key of keys) {
			if (!seen.includes(key)) {
				delete this.compiled[key];
			}
		}

		return Promise.all(done)
			.then(() => {})
			.catch(() => {});
	}

	#select(file: File) {
		this.#current = file as File;
		this.#view?.setState(this.#get_state(this.#current));
	}

	#update_file(file: File) {
		if (file.name === this.#current.name) {
			this.#current = file;
		}

		this.#files = this.#files.map((old) => {
			if (old.name === file.name) {
				return file;
			}
			return old;
		});

		this.modified[file.name] = true;

		if (BROWSER && is_svelte_file(file)) {
			compile_file(file, this.#svelte_version, this.compiler_options).then((compiled) => {
				this.compiled[file.name] = compiled;
			});
		}

		this.#onupdate(file);
	}

	#update_state(file: File, state: EditorState) {
		const existing = state.doc.toString();

		if (file.contents !== existing) {
			const current_cursor_position = Math.min(
				this.#view?.state.selection.ranges[0].from!,
				file.contents.length
			);

			const transaction = state.update({
				changes: {
					from: 0,
					to: existing.length,
					insert: file.contents
				},
				selection: {
					anchor: current_cursor_position,
					head: current_cursor_position
				}
			});

			this.states.set(file.name, transaction.state);

			if (file === this.#current) {
				this.#view?.setState(transaction.state);
			}
		}
	}
}
