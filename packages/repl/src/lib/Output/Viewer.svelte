<script lang="ts">
	import { get_repl_context } from '../context';
	import { BROWSER } from 'esm-env';
	import { onMount, untrack } from 'svelte';
	import Message from '../Message.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import ReplProxy from './ReplProxy.js';
	import Console from './console/Console.svelte';
	import getLocationFromStack from './get-location-from-stack';
	import srcdoc from './srcdoc/index.html?raw';
	import srcdoc_styles from './srcdoc/styles.css?raw';
	import ErrorOverlay from './ErrorOverlay.svelte';
	import type { CompileError } from 'svelte/compiler';
	import type Bundler from '../Bundler.svelte';
	import type { BundleResult } from '../public';
	import { Log } from './console/Log.svelte';

	interface Props {
		error: Error | null;
		/** status by Bundler class instance */
		status: string | null;
		/** sandbox allow-same-origin */
		relaxed?: boolean;
		/** sandbox allow-popups-to-escape-sandbox (i.e. links within the REPL to other pages work) */
		can_escape?: boolean;
		/** Any additional JS you may want to inject */
		injectedJS?: string;
		/** Any additional CSS you may want to inject */
		injectedCSS?: string;
		theme: 'light' | 'dark';
		/** The current bundler. Takes precedence over REPL context, if set */
		bundler?: Bundler;
		/** Called everytime a log is pushed. If this is set, the built-in console coming with the Viewer isn't shown */
		onLog?: ((logs: Log[]) => void) | undefined;
	}

	let {
		error = $bindable(),
		status,
		relaxed = false,
		can_escape = false,
		injectedJS = '',
		injectedCSS = '',
		theme,
		bundler,
		onLog = undefined
	}: Props = $props();

	let context = get_repl_context();
	let bundle = $derived((bundler ?? context?.bundler)?.result);

	let logs: Log[] = $state([]);
	let log_group_stack: Log[][] = [];
	// svelte-ignore state_referenced_locally
	let current_log_group = logs;
	let last_console_event: Log;

	let iframe = $state.raw<HTMLIFrameElement>();
	let pending_imports = $state(0);
	let pending = false;

	let proxy: ReplProxy | null = $state.raw(null);
	let ready = $state(false);
	let inited = $state(false);

	onMount(() => {
		proxy = new ReplProxy(iframe!, {
			on_fetch_progress: (progress) => {
				pending_imports = progress;
			},
			on_error: (event) => {
				push_logs({ command: 'error', args: [event.value] });
			},
			on_unhandled_rejection: (event) => {
				let error = event.value;
				if (typeof error === 'string') error = { message: error };
				error.message = 'Uncaught (in promise): ' + error.message;
				push_logs({ command: 'error', args: [error] });
			},
			on_iframe_reload: () => {
				ready = false;
			},
			on_console: (log) => {
				switch (log.command) {
					case 'clear':
						clear_logs();
						push_logs(log);
						break;

					case 'group':
						group_logs(log);
						break;

					case 'groupEnd':
						ungroup_logs();
						break;

					case 'duplicate':
						increment_duplicate_log();
						break;

					default:
						push_logs(log);
				}
			}
		});

		iframe!.addEventListener('load', () => {
			proxy?.handle_links();
			ready = true;
		});

		return () => {
			proxy?.destroy();
		};
	});

	$effect(() => {
		if (ready) {
			proxy?.iframe_command('set_theme', { theme });
		}
	});

	async function apply_bundle(bundle: BundleResult | null) {
		if (!bundle) return;

		try {
			clear_logs();

			if (!bundle.error) {
				await proxy?.eval(
					`
					${injectedJS}

					if (!window.__setup_focus_handling) {
						let can_focus = false;

						window.addEventListener('pointerdown', (e) => (can_focus = true));
						window.addEventListener('pointerup', (e) => (can_focus = false));
						window.addEventListener('keydown', (e) => (can_focus = true));
						window.addEventListener('keyup', (e) => (can_focus = false));

						/**
						 * The iframe sometimes takes focus control in ways we can't prevent
						 * while the editor is focused. Refocus the editor in these cases.
						 */
						window.addEventListener('focusin', (e) => {
							// if focusin happened as a result of a mouse/keyboard event, allow it
							if (can_focus) return;

							// if \`e.target\` is the \`<body>\` and there's a \`relatedTarget\`,
							// assume the focusin was the result of a user navigation — allow it
							if (e.target.tagName === 'BODY' && e.relatedTarget) return;

							// otherwise, broadcast an event that causes the editor to reclaim focus
							parent.postMessage({ type: 'iframe_took_focus' }, '*');
						});

						window.__setup_focus_handling = true;
					}

					{
						const styles = document.querySelectorAll('style[id^=svelte-]');

						let i = styles.length;
						while (i--) styles[i].parentNode.removeChild(styles[i]);

						if (window.__unmount_previous) {
							try {
								window.__unmount_previous();
							} catch (err) {
								console.error(err);
							}
						}
						window.__reset_custom_elements?.();

						document.body.innerHTML = '';
						window._svelteTransitionManager = null;
					}

					if (!window.__reset_custom_elements) {
						const registered = new Map();
						const define = CustomElementRegistry.prototype.define;
						CustomElementRegistry.prototype.define = function(name, el, options) {
							let ce = registered.get(name);
							if (ce) {
								if (ce.registered) {
									// trigger error of re-registering
									define.call(this, name, ce.el, options);
								}
								if (ce.options?.extends != options?.extends) {
									parent.postMessage({ action: 'iframe_reload' }, '*');
									location.reload();
								}
								ce.el = el;
								ce.registered = true;
							} else {
								ce = { el, options, registered: true };
								registered.set(name, ce);
								const Wrapper = class extends el {
									connectedCallback() {
										ce.el.prototype.connectedCallback?.apply(this, arguments);
									}
									disconnectedCallback() {
										ce.el.prototype.disconnectedCallback?.apply(this, arguments);
									}
									adoptedCallback() {
										ce.el.prototype.adoptedCallback?.apply(this, arguments);
									}
								};
								const DynamicWrapper = new Proxy(Wrapper, {
									construct: function (_, args, newTarget) {
										return Reflect.construct(ce.el, args, newTarget);
									}
								});
								try {
									define.call(this, name, DynamicWrapper, options);
								} catch (error) {
									console.error(error);
									throw new Error('Failed to define a custom element '+name);
								}
							}
						};
						window.__reset_custom_elements = () => {
							for (const ce of registered.values()) {
								if (ce.registered) {
									ce.el = HTMLElement;
									ce.registered = false;
								}
							}
						}
					}

					const __repl_exports = ${bundle.client?.code};
					{
						const { mount, unmount, App, untrack } = __repl_exports;

						const console_methods = ['log', 'error', 'trace', 'assert', 'warn', 'table', 'group'];

						// The REPL hooks up to the console to provide a virtual console. However, the implementation
						// needs to stringify the console to pass over a MessageChannel, which means that the object
						// can get deeply read and tracked by accident when using the console. We can avoid this by
						// ensuring we untrack the main console methods.

						const original = {};

						for (const method of console_methods) {
							original[method] = console[method];
							console[method] = function (...v) {
								return untrack(() => original[method].apply(this, v));
							}
						}
						let component;
						try {
							component = mount(App, { target: document.body });
						} finally {
							window.__unmount_previous = () => {
								for (const method of console_methods) {
									console[method] = original[method];
								}
								if (component) unmount(component);
								window.__unmount_previous = null;
							}
						}
					}
					//# sourceURL=playground:output
				`,
					bundle?.css ?? srcdoc_styles
				);
				error = null;
			}
		} catch (e) {
			console.error(e); // make it show up in the console, too, not just the UI
			// @ts-ignore
			show_error(e);
		}

		inited = true;
	}

	$effect(() => {
		if (ready) {
			const b = bundle;

			// TODO tidy up
			untrack(() => {
				apply_bundle(b);
			});
		}
	});

	$effect(() => {
		if (injectedCSS && proxy && ready) {
			proxy.eval(
				`{
					const style = document.createElement('style');
					style.textContent = ${JSON.stringify(injectedCSS)};
					document.head.appendChild(style);
				}`
			);
		}
	});

	function show_error(e: CompileError & { loc: { line: number; column: number } }) {
		const map = bundle?.client?.map;

		// @ts-ignore INVESTIGATE
		const loc = map && getLocationFromStack(e.stack, map);
		if (loc) {
			e.filename = loc.source;
			e.loc = { line: loc.line, column: loc.column ?? 0 };
		}

		// @ts-ignore name is there, just not part of public API
		error = e;
	}

	function push_logs(data: any) {
		const log = new Log(data);
		current_log_group.push((last_console_event = log));
		onLog?.(logs);
	}

	function group_logs(data: any) {
		const log = new Log(data);
		current_log_group.push(log);
		// TODO: Investigate
		log_group_stack.push(current_log_group);
		current_log_group = log.logs;
		onLog?.(logs);
	}

	function ungroup_logs() {
		const last = log_group_stack.pop();

		if (last) current_log_group = last;
	}

	function increment_duplicate_log() {
		last_console_event.count += 1;

		if (current_log_group.includes(last_console_event)) {
			onLog?.(logs);
		} else {
			// console was cleared
			push_logs(last_console_event);
		}
	}

	function clear_logs() {
		current_log_group = logs = [];
		onLog?.(logs);
	}
</script>

{#snippet main()}
	<iframe
		title="Result"
		class:inited
		bind:this={iframe}
		sandbox={[
			'allow-scripts',
			'allow-popups',
			'allow-forms',
			'allow-pointer-lock',
			'allow-modals',
			can_escape ? 'allow-popups-to-escape-sandbox' : '',
			relaxed ? 'allow-same-origin' : ''
		].join(' ')}
		class={error || pending || pending_imports ? 'greyed-out' : ''}
		srcdoc={BROWSER ? srcdoc : ''}
	></iframe>

	<div class="overlay">
		{#if bundle?.error}
			<ErrorOverlay error={bundle.error} />
		{:else if error}
			<Message kind="error" details={error} />
		{:else if status || !bundle}
			<Message kind="info" truncate>{status || 'loading Svelte compiler...'}</Message>
		{/if}
	</div>
{/snippet}

<div class="iframe-container">
	{#if !onLog}
		<PaneWithPanel pos="100%" panel="Console" {main}>
			{#snippet header()}
				<button
					class="raised"
					disabled={logs.length === 0}
					onclick={(e) => {
						e.stopPropagation();
						clear_logs();
					}}
				>
					{#if logs.length > 0}
						({logs.length})
					{/if}
					Clear
				</button>
			{/snippet}

			{#snippet body()}
				<Console {logs} />
			{/snippet}
		</PaneWithPanel>
	{:else}
		{@render main()}
	{/if}
</div>

<style>
	.iframe-container {
		position: absolute;
		background-color: var(--sk-bg-1, white);
		border: none;
		width: 100%;
		height: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.greyed-out {
		filter: grayscale(50%) blur(1px);
		opacity: 0.25;
	}

	/* TODO this stuff should live in global styles */
	button {
		font: var(--sk-font-ui-small);
		text-transform: uppercase;
		display: block;
		padding: 0.3rem 0.8rem;

		&:disabled {
			color: var(--sk-fg-4);
		}
	}

	.overlay {
		position: absolute;
		top: 0;
		width: 100%;
	}
</style>
