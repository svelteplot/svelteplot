<script lang="ts">
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { ScreenToggle } from '@sveltejs/site-kit/components';
	import { BROWSER } from 'esm-env';
	import { writable } from 'svelte/store';
	import Bundler from './Bundler.svelte.js';
	import ComponentSelector from './Input/ComponentSelector.svelte';
	import Output from './Output/Output.svelte';
	import { set_repl_context } from './context.js';
	import { Workspace, type File } from './Workspace.svelte.js';
	import Editor from './Editor/Editor.svelte';
	import type { ReplContext } from './types.js';

	interface Props {
		svelteVersion?: string;
		embedded?: boolean | 'output-only';
		orientation?: 'columns' | 'rows';
		relaxed?: boolean;
		can_escape?: boolean;
		fixed?: boolean;
		fixedPos?: number;
		injectedJS?: string;
		injectedCSS?: string;
		previewTheme?: 'light' | 'dark';
		showOutput?: boolean;
		onversion?: (version: string) => void;
		onchange?: () => void;
		download?: () => void;
		/**
		 * Invoked whenever there's a bundler or runtime error
		 */
		onerror?: (error: Error) => void;
	}

	let {
		svelteVersion = 'latest',
		embedded = false,
		orientation = 'columns',
		relaxed = false,
		can_escape = false,
		fixed = false,
		fixedPos = 50,
		injectedJS = '',
		injectedCSS = '',
		previewTheme = 'light',
		showOutput = true,
		onversion,
		onchange = () => {},
		download,
		onerror
	}: Props = $props();

	// TODO pass in real data
	const dummy: File = {
		type: 'file',
		name: 'App.svelte',
		basename: 'App.svelte',
		contents: '',
		text: true
	};

	const workspace: Workspace = new Workspace([dummy], {
		initial: 'App.svelte',
		// svelte-ignore state_referenced_locally
		svelte_version: svelteVersion,
		onupdate() {
			rebundle();
			onchange?.();
		},
		onreset() {
			// Return promise so we can await it in the workspace
			return rebundle();
		}
	});

	// TODO get rid
	export function toJSON() {
		return {
			imports: bundler!.result?.imports ?? [],
			files: workspace.files,
			tailwind: workspace.tailwind,
			aliases: workspace.aliases
		};
	}

	// Our own playground / v0 need this
	export async function set(data: {
		files: File[];
		tailwind?: boolean;
		aliases?: Record<string, string>;
	}) {
		// Await promise so that users (v0 in this case) can know when the bundling is done
		await workspace.reset(
			data.files,
			{ tailwind: data.tailwind ?? false, aliases: data.aliases },
			'App.svelte'
		);
	}

	// v0 needs this
	export function get_asts() {
		return Object.fromEntries(
			Object.entries(workspace.compiled).map(([name, compiled]) => [
				name,
				compiled.result?.ast ?? null
			])
		);
	}

	// TODO get rid
	export function markSaved() {
		workspace.mark_saved();
	}

	const toggleable: ReplContext['toggleable'] = writable(false);

	function rebundle() {
		return bundler!.bundle(workspace.files as File[], {
			svelte_version: workspace.svelte_version,
			tailwind: workspace.tailwind,
			fragments: workspace.compiler_options.fragments,
			async: workspace.compiler_options.async,
			aliases: workspace.aliases
		});
	}

	async function migrate() {
		if (!can_migrate) return; // belt and braces — button is already disabled

		workspace.update_file({
			...workspace.current!,
			contents: migration!.code
		});
	}

	let width = $state(0);
	let toggled = $state(false);
	let status: string | null = $state(null);
	let runtime_error: Error | null = $state(null);
	let status_visible = $state(false);
	let status_timeout: NodeJS.Timeout | undefined = undefined;

	const bundler = BROWSER
		? new Bundler({
				// svelte-ignore state_referenced_locally
				svelte_version: svelteVersion,
				onversion: (version, supports_async) => {
					workspace.set_svelte_version(version);
					workspace.supports_async = supports_async;
					if (!supports_async && workspace.compiler_options.async) {
						workspace.update_compiler_options({ async: false });
					}
					onversion?.(version);
				},
				onstatus: (message) => {
					if (message) {
						// show bundler status, but only after time has elapsed, to
						// prevent the banner flickering
						if (!status_visible && !status_timeout) {
							status_timeout = setTimeout(() => {
								status_visible = true;
							}, 400);
						}
					} else {
						clearTimeout(status_timeout);
						status_visible = false;
						status_timeout = undefined;
					}
					status = message;
				},
				onerror: (message) => {
					runtime_error = new Error(message);
				}
			})
		: null;

	set_repl_context({
		bundler,
		toggleable,
		workspace,
		get svelteVersion() {
			// we want this to be reactive since we are checking in
			// the compiler options
			return svelteVersion;
		}
	});

	function before_unload(event: BeforeUnloadEvent) {
		if (Object.keys(workspace.modified).length > 0) {
			event.preventDefault();
			event.returnValue = '';
		}
	}
	let mobile = $derived(width < 540);

	$effect(() => {
		$toggleable = mobile && orientation === 'columns' && embedded !== 'output-only';
	});

	$effect(() => {
		if (runtime_error) {
			onerror?.(runtime_error);
		}
	});

	$effect(() => {
		if (bundler?.result?.error) {
			onerror?.(bundler.result.error as Error);
		}
	});

	let runes = $derived(
		workspace.current.name.endsWith('.svelte.js') ||
			(workspace.current_compiled?.result?.metadata.runes ?? false)
	);

	let migration = $derived(workspace.current_compiled?.migration);
	let can_migrate = $derived(migration ? migration.code !== workspace.current?.contents : false);
</script>

<svelte:window onbeforeunload={before_unload} />

<div
	class="container {embedded === 'output-only' ? '' : 'container-normal'}"
	class:embedded
	class:toggleable={$toggleable}
	bind:clientWidth={width}
>
	<div class="viewport" class:output={showOutput} class:transition={toggled}>
		<SplitPane
			id="main"
			type={orientation}
			pos="{embedded === 'output-only'
				? 0
				: mobile || fixed
					? fixedPos
					: orientation === 'rows'
						? 60
						: 50}%"
			min={embedded === 'output-only' ? '0px' : '100px'}
			max="-4.1rem"
		>
			{#snippet a()}
				<section>
					<ComponentSelector {runes} {onchange} {workspace} {can_migrate} {migrate} {download} />

					<Editor {workspace} />
				</section>
			{/snippet}

			{#snippet b()}
				<section>
					<Output
						status={status_visible ? status : null}
						{embedded}
						{relaxed}
						{can_escape}
						{injectedJS}
						{injectedCSS}
						{previewTheme}
						{workspace}
						bind:runtimeError={runtime_error}
					/>
				</section>
			{/snippet}
		</SplitPane>
	</div>

	{#if $toggleable}
		<ScreenToggle
			bind:checked={
				() => showOutput,
				(v) => {
					toggled ||= true;
					showOutput = v;
				}
			}
		/>
	{/if}
</div>

<style>
	.container {
		position: relative;
		flex: 1;
		height: 100%;
		min-height: 0;
		background: var(--sk-bg-1);
		padding: 0;

		&.embedded {
			height: 100%;
		}

		section {
			position: relative;
			padding: var(--sk-pane-controls-height) 0 0 0;
			height: 100%;
			box-sizing: border-box;

			:global {
				& > :first-child {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: var(--sk-pane-controls-height);
					box-sizing: border-box;
				}

				& > :last-child {
					width: 100%;
					height: 100%;
				}
			}
		}

		:global [data-pane='main'] > svelte-split-pane-divider::after {
			height: calc(100% - var(--sk-pane-controls-height));
			top: var(--sk-pane-controls-height);
		}
	}

	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - var(--sk-pane-controls-height));
	}

	.toggleable .viewport.output {
		transform: translate(-50%);
	}

	.toggleable .viewport.transition {
		transition: transform 0.3s;
	}

	/* on mobile, override the <SplitPane> controls */
	@media (max-width: 799px) {
		.container-normal :global {
			[data-pane='main'] {
				--pos: 50% !important;
			}

			[data-pane='editor'] {
				--pos: 5.4rem !important;
			}

			[data-pane] svelte-split-pane-divider {
				cursor: default;
			}
		}
	}
</style>
