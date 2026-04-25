<script lang="ts">
	import RunesInfo from './RunesInfo.svelte';
	import type { Workspace, File } from '../Workspace.svelte';
	import { tick } from 'svelte';
	import { Checkbox, Toolbox } from '@sveltejs/site-kit/components';

	interface Props {
		runes: boolean;
		onchange: () => void;
		workspace: Workspace;
		can_migrate: boolean;
		migrate: () => void;
		download?: () => void;
	}

	let { runes, onchange, workspace, can_migrate, migrate, download }: Props = $props();

	let input = $state() as HTMLInputElement;

	// svelte-ignore state_referenced_locally
	let input_value = $state(workspace.current.name);

	async function close_edit(file: File) {
		if (input_value === file.name || input_value === '') {
			// nothing to do
			input_value = file.name;
			return;
		}

		const deconflicted = deconflict(input_value, file);

		workspace.rename(file, deconflicted);
		workspace.focus();
	}

	function deconflict(name: string, file?: File) {
		let deconflicted = name;
		let i = 1;

		while (true) {
			const existing = workspace.files.find((file) => file.name === deconflicted);
			if (!existing || existing === file) return deconflicted;

			deconflicted = name.replace(/(\.|$)/, `${i++}$1`);
		}
	}

	function remove_file(file: File) {
		let result = confirm(`Are you sure you want to delete ${file.name}?`);
		if (!result) return;

		workspace.remove(file);

		onchange();
	}

	async function add_new() {
		const basename = deconflict(`Component.svelte`);

		const file = workspace.add({
			type: 'file',
			name: basename,
			basename,
			contents: '',
			text: true
		});

		input_value = file.name;
		onchange();

		await tick();
		input.focus();
	}

	// drag and drop
	let dragging: File | null = null;
	let dragover: File | null = $state.raw(null);
</script>

<div class="component-selector">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="file-tabs">
		{#each workspace.files as File[] as file, index (file.name)}
			<div
				class="button"
				class:editable={file.name !== 'App.svelte'}
				role="button"
				tabindex="0"
				aria-current={file === workspace.current}
				class:drag-over={file === dragover}
				onclick={() => {
					workspace.select(file.name);
					input_value = file.name;
				}}
				onkeyup={(e) => e.key === ' ' && workspace.select(file.name)}
				draggable="true"
				ondragstart={() => (dragging = file)}
				ondragover={(e) => (e.preventDefault(), (dragover = file))}
				ondragleave={(e) => (e.preventDefault(), (dragover = null))}
				ondrop={() => {
					if (dragging && dragover) {
						workspace.move(dragging, dragover);
					}

					dragging = dragover = null;
				}}
			>
				<i class="drag-handle"></i>

				<span class="filename">
					{(file === workspace.current && file.name !== 'App.svelte' ? input_value : file.name) +
						(workspace.modified[file.name] ? '*' : '') || ' '}
				</span>

				{#if file === workspace.current && file.name !== 'App.svelte'}
					<!-- svelte-ignore a11y_autofocus -->
					<input
						spellcheck={false}
						bind:this={input}
						bind:value={input_value}
						onfocus={async (event) => {
							const input = event.currentTarget;
							setTimeout(() => {
								input.select();
							});
						}}
						onblur={() => close_edit(file)}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.currentTarget.blur();
							}

							if (e.key === 'Escape') {
								input_value = file.name;
								e.currentTarget.blur();
							}
						}}
					/>

					<span
						class="remove"
						onclick={(e) => {
							// TODO make this a real button, get rid of the keyup listener
							remove_file(file);
							e.stopPropagation();
						}}
						onkeyup={(e) => e.key === ' ' && remove_file(file)}
					>
						<svg viewBox="0 0 24 24">
							<line stroke="#999" x1="18" y1="6" x2="6" y2="18" />
							<line stroke="#999" x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</span>
				{/if}
			</div>
		{/each}
	</div>

	<button
		class="raised add-new"
		onclick={add_new}
		aria-label="add new component"
		title="add new component"><span class="icon"></span></button
	>

	<div class="runes">
		<RunesInfo {runes} />
		<Toolbox>
			<label class="option">
				<span>Toggle Vim mode</span>
				<Checkbox bind:checked={workspace.vim}></Checkbox>
			</label>

			<label class="option">
				<span>Toggle Tailwind</span>
				<Checkbox bind:checked={workspace.tailwind}></Checkbox>
			</label>

			<label class="option" aria-disabled={!workspace.supports_async}>
				<span>Async mode</span>
				<Checkbox
					disabled={!workspace.supports_async}
					checked={workspace.compiler_options.async}
					onchange={() =>
						workspace.update_compiler_options({ async: !workspace.compiler_options.async })}
				></Checkbox>
			</label>

			<button disabled={!can_migrate} onclick={migrate}>Migrate to Svelte 5, if possible</button>

			<label class="option">
				<span>Svelte version</span>
				<input
					value={workspace.svelte_version}
					placeholder="latest"
					onchange={(ev) => workspace.set_svelte_version(ev.currentTarget.value || 'latest', true)}
				/>
			</label>

			{#if download}
				<button onclick={download}>Download app</button>
			{/if}

			<button
				class="copy-button"
				title="Copy `npx sv create --from-playground=&quot;...&quot;` to clipboard"
				aria-label="Copy `npx sv create --from-playground=&quot;...&quot;` to clipboard"
				onclick={() => {
					navigator.clipboard.writeText(
						`npx sv create --from-playground="${window.location.href}"`
					);
				}}
			>
				Set up locally
			</button>
		</Toolbox>
	</div>
</div>

<style>
	.component-selector {
		position: relative;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0 1rem 0 0;

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

	.file-tabs {
		border: none;
		margin: 0;
		height: 100%;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.file-tabs .button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font: var(--sk-font-ui-small);
		border: none;
		padding: 0 1rem;
		height: 100%;
		cursor: pointer;
	}

	.file-tabs .button {
		--padding-left: 2.6rem;
		--padding-right: 1.4rem;
		padding: 0 var(--padding-right) 0 var(--padding-left);

		&.editable {
			--padding-right: 1.8rem;
		}

		.drag-handle {
			cursor: move;
			width: 2em;
			height: 100%;
			position: absolute;
			left: 0em;
			top: 0;
			background: url(icons/file) 50% 50% no-repeat;
			background-size: 1em;
		}

		.remove {
			position: absolute;
			display: none;
			top: 0;
			right: 0;
			padding: 0 0.2rem;
			width: 1.6rem;
			height: 100%;
			cursor: pointer;

			svg {
				width: 100%;
				height: 100%;
			}
		}

		&.drag-over {
			background: var(--sk-bg-4);
		}

		&[aria-current='true'] {
			border-bottom: 1px solid var(--sk-fg-accent);

			&.editable .filename {
				cursor: text;
			}

			.remove {
				display: block;
			}
		}
	}

	.file-tabs input {
		position: absolute;
		width: calc(100% - var(--padding-left) - var(--padding-right));
		border: none;
		outline: none;
		background-color: inherit;
		color: inherit;
		top: 0;
		left: var(--padding-left);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--sk-font-family-ui);
		font: var(--sk-font-ui-small); /* TODO can we just inherit */
		box-sizing: border-box;

		&:focus {
			color: var(--sk-fg-accent);
		}
	}

	.add-new {
		height: 3.2rem;
		aspect-ratio: 1;

		.icon {
			background: currentColor;
			mask: url(icons/file-new) 50% 50% no-repeat;
			mask-size: 1.2em;
		}
	}

	.runes {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.option {
		height: 3.6rem;

		&[aria-disabled='true'] {
			color: var(--sk-fg-4);
		}

		input {
			background: transparent;
			border: none;
			border-radius: var(--sk-border-radius);
			color: currentColor;
			width: 0;
			flex: 1;
			padding: 0.2rem 0.6rem;
			height: 3.2rem;
			font: var(--sk-font-ui-medium);
			margin: -0.5rem -0.6rem -0.5rem 1rem;
			text-align: right;
		}
	}

	svg {
		position: relative;
		overflow: hidden;
		vertical-align: middle;
		-o-object-fit: contain;
		object-fit: contain;
		-webkit-transform-origin: center center;
		transform-origin: center center;

		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.copy-button {
		position: relative;

		&::before,
		&::after {
			content: '';
			display: block;
			position: absolute;
			width: 100%;
			height: 100%;
			right: 0;
			top: 0;
			background: currentColor;
			mask: no-repeat calc(100% - 1rem) 50% / 1.6rem 1.6rem;
			transition: opacity 0.2s;
			transition-delay: 0.6s;
		}

		&::before {
			mask-image: url(icons/copy-to-clipboard);
		}

		&::after {
			mask-image: url(icons/check);
			opacity: 0;
		}

		&:active::before {
			opacity: 0;
			transition: none;
		}

		&:active::after {
			opacity: 1;
			transition: none;
		}
	}
</style>
