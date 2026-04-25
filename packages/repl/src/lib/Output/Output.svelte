<script lang="ts">
	import { marked } from 'marked';
	import { locate } from 'locate-character';
	import AstView from './AstView.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import Viewer from './Viewer.svelte';
	import { Workspace, type File } from '../Workspace.svelte';
	import Editor from '../Editor/Editor.svelte';
	import { untrack } from 'svelte';
	import { decode, type SourceMapSegment } from '@jridgewell/sourcemap-codec';

	interface Props {
		status: string | null;
		runtimeError?: Error | null;
		embedded?: boolean | 'output-only';
		relaxed?: boolean;
		can_escape?: boolean;
		injectedJS: string;
		injectedCSS: string;
		previewTheme: 'light' | 'dark';
		workspace: Workspace;
	}

	let {
		status,
		runtimeError = $bindable(null),
		embedded = false,
		relaxed = false,
		can_escape = false,
		injectedJS,
		injectedCSS,
		previewTheme,
		workspace
	}: Props = $props();

	let view: 'result' | 'js' | 'css' | 'ast' = $state('result');

	const js: File = {
		type: 'file',
		name: 'output.js',
		basename: 'output.js',
		contents: '',
		text: true
	};

	const css: File = {
		type: 'file',
		name: 'output.css',
		basename: 'output.css',
		contents: '',
		text: true
	};

	const js_workspace = new Workspace([js], {
		readonly: true
	});

	const css_workspace = new Workspace([css], {
		readonly: true
	});

	let is_markdown = $derived(workspace.current.name.endsWith('.md'));

	let markdown = $derived(is_markdown ? (marked.parse(workspace.current!.contents) as string) : '');

	let current = $derived(workspace.current_compiled);

	// TODO this effect is a bit of a code smell
	$effect(() => {
		if (current?.error) {
			js.contents = css.contents = `/* ${current.error.message} */`;
		} else if (current?.result) {
			js.contents = current.result.js.code;
			css.contents =
				current.result.css?.code ?? `/* Add a <st` + `yle> tag to see the CSS output */`;
		} else {
			js.contents = css.contents = `/* Select a component to see its compiled code */`;
		}

		// TODO the untrack should probably go in update_file
		untrack(() => {
			js_workspace.update_file(js);
			css_workspace.update_file(css);
		});
	});

	$effect(() => {
		if (markdown) return;

		if (view === 'js' || view === 'css') {
			const v = view; // so that TS doesn't think it could become something different
			const output = v === 'js' ? js_workspace : css_workspace;

			const highlight = (
				line: number,
				a: SourceMapSegment,
				b: SourceMapSegment,
				scroll_input: boolean,
				scroll_output: boolean
			) => {
				const split = {
					original: workspace.current!.contents.split('\n'),
					generated: current!.result![v]!.code.split('\n')
				};

				const original = {
					start: split.original.slice(0, a[2]).join('\n').length + 1 + a[3]!,
					end: split.original.slice(0, b[2]).join('\n').length + 1 + b[3]!
				};

				const generated = {
					start: split.generated.slice(0, line).join('\n').length + 1 + a[0],
					end: split.generated.slice(0, line).join('\n').length + 1 + b[0]
				};

				workspace.highlight_range(original, scroll_input);
				output.highlight_range(generated, scroll_output);
			};

			const clear = () => {
				workspace.highlight_range(null);
				output.highlight_range(null);
			};

			const from_input = (pos: number, should_scroll: boolean) => {
				if (!current?.result?.[v]?.map) return;

				const mappings = decode(current.result[v].map.mappings);

				const { line, column } = locate(workspace.current.contents, pos)!;

				for (let i = 0; i < mappings.length; i += 1) {
					const segments = mappings[i];
					for (let j = 0; j < segments.length - 1; j += 1) {
						// segment is [generated_column, source_index, original_line, original_column]
						const a = segments[j];
						const b = segments[j + 1];

						if (a[2]! > line) continue;
						if (b[2]! < line) continue;

						if (a[2]! === line && a[3]! > column) continue;
						if (b[2]! === line && b[3]! < column) continue;

						// if we're still here, we have a match
						highlight(i, a, b, false, should_scroll);
						return;
					}

					clear();
				}
			};

			const from_output = (pos: number, should_scroll: boolean) => {
				if (!current?.result?.[v]?.map) return;

				const mappings = decode(current.result[v].map.mappings);

				const { line, column } = locate(current.result[v].code, pos)!;

				const segments = mappings[line];

				for (let i = 0; i < segments.length - 1; i += 1) {
					const a = segments[i];
					const b = segments[i + 1];

					if (a[0] <= column && b[0] >= column) {
						highlight(line, a, b, should_scroll, false);
						return;
					}

					clear();
				}
			};

			workspace.onhover((pos) => (pos === null ? clear() : from_input(pos, false)));
			workspace.onselect((from, to) => from === to && from_input(from, true));

			output.onhover((pos) => (pos === null ? clear() : from_output(pos, false)));
			output.onselect((from, to) => from === to && from_output(from, true));
		}
	});
</script>

{#if embedded !== 'output-only'}
	<div class="view-toggle">
		{#if workspace.current.name.endsWith('.md')}
			<button class="active">Markdown</button>
		{:else}
			<button aria-current={view === 'result'} onclick={() => (view = 'result')}>Result</button>
			<button aria-current={view === 'js'} onclick={() => (view = 'js')}>JS output</button>
			<button aria-current={view === 'css'} onclick={() => (view = 'css')}>CSS output</button>
			<button aria-current={view === 'ast'} onclick={() => (view = 'ast')}>AST output</button>
		{/if}
	</div>
{/if}

<!-- component viewer -->
<div class="tab-content" class:visible={!is_markdown && view === 'result'}>
	<Viewer
		bind:error={runtimeError}
		{status}
		{relaxed}
		{can_escape}
		{injectedJS}
		{injectedCSS}
		onLog={embedded === 'output-only' ? () => {} : undefined}
		theme={previewTheme}
	/>
</div>

<!-- js output -->
<div class="tab-content" class:visible={!is_markdown && view === 'js'}>
	{#if embedded}
		<Editor workspace={js_workspace} />
	{:else}
		<PaneWithPanel min="-27rem" pos="-27rem" panel="Compiler options">
			{#snippet main()}
				<Editor workspace={js_workspace} />
			{/snippet}

			{#snippet body()}
				<CompilerOptions {workspace} />
			{/snippet}
		</PaneWithPanel>
	{/if}
</div>

<!-- css output -->
<div class="tab-content" class:visible={!is_markdown && view === 'css'}>
	<Editor workspace={css_workspace} />
</div>

<!-- ast output -->
{#if current?.result}
	<div class="tab-content" class:visible={!is_markdown && view === 'ast'}>
		<AstView {workspace} ast={current.result.ast} active={!is_markdown && view === 'ast'} />
	</div>
{/if}

<!-- markdown output -->
<div class="tab-content" class:visible={is_markdown}>
	<iframe title="Markdown" srcdoc={markdown}></iframe>
</div>

<style>
	.view-toggle {
		height: var(--sk-pane-controls-height);
		overflow: hidden;
		white-space: nowrap;
		box-sizing: border-box;
		font: var(--sk-font-ui-small);

		/* fake border (allows tab borders to appear above it) */
		&::before {
			content: '';
			position: absolute;
			width: 100%;
			height: 1px;
			bottom: 0px;
			left: 0;
			background-color: var(--sk-border);
		}
	}

	button {
		height: 100%;
		background: transparent;
		text-align: left;
		position: relative;
		font: var(--sk-font-ui-small); /* TODO should probably be a global button style */
		border: none;
		border-bottom: 1px solid transparent;
		padding: 0 1rem;
		border-radius: 0;

		&[aria-current='true'] {
			border-bottom: 1px solid var(--sk-fg-accent);
		}
	}

	.tab-content {
		position: absolute;
		width: 100%;
		height: calc(100% - var(--sk-pane-controls-height)) !important;
		visibility: hidden;
		pointer-events: none;
	}

	.tab-content.visible {
		visibility: visible;
		pointer-events: all;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
</style>
