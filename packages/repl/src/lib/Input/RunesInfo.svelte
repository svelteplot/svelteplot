<script lang="ts">
	import { Dropdown } from '@sveltejs/site-kit/components';
	import { get_repl_context } from '../context';

	let { runes }: { runes: boolean } = $props();

	const { workspace, svelteVersion } = get_repl_context();
	const majorVersion = Number(svelteVersion.split('.')[0]);
</script>

<Dropdown align="right">
	<div class="target">
		<span class="lightning" class:active={runes} role="presentation"></span>

		<span>runes</span>
	</div>

	{#snippet dropdown()}
		<div class="popup">
			{#if Number.isInteger(majorVersion) && majorVersion < 5}
				<p>
					<a href="/blog/runes">Runes</a> are available from Svelte 5 onwards, and this playground
					is using Svelte {svelteVersion}.
				</p>
			{:else if workspace.current.name.endsWith('.svelte.js')}
				<p>
					Files with a <code>.svelte.js</code> extension are always in
					<a href="/blog/runes">runes mode</a>.
				</p>
			{:else if workspace.current.name.endsWith('.js')}
				<p>
					To use <a href="/blog/runes">runes</a> in a JavaScript file, change the extension to
					<code>.svelte.js</code>.
				</p>
			{:else if workspace.current.name.endsWith('.svelte')}
				{#if runes}
					<p>
						This component is in
						<a href="/blog/runes">runes mode</a>.
					</p>
					<p>To disable runes mode, add the following to the top of your component:</p>
					<pre><code>&lt;svelte:options runes={'{false}'} /&gt;</code></pre>
				{:else}
					<p>This component is not in <a href="/blog/runes">runes mode</a>.</p>
					<p>
						To enable runes mode, either start using runes in your code, or add the following to the
						top of your component:
					</p>
					<pre><code>&lt;svelte:options runes /&gt;</code></pre>
				{/if}
			{:else}
				<p>
					Edit a <code>.svelte</code>, <code>.svelte.js</code> or <code>.js</code> file to see
					information on <a href="/blog/runes">runes mode</a>
				</p>
			{/if}
		</div>
	{/snippet}
</Dropdown>

<style>
	.target {
		text-transform: uppercase;
		font: var(--sk-font-ui-small);
		position: relative;
		display: flex;
		align-items: center;

		height: 100%;
		padding: 0 0.8rem;
		gap: 0.5rem;
		z-index: 2;
	}

	span.lightning {
		width: 1.8rem;
		height: 1.8rem;
		z-index: 9999;
		background: var(--sk-fg-4);
		mask: url(icons/runes-off) no-repeat 50% 50%;
		mask-size: contain;

		&.active {
			background: var(--sk-fg-accent);
			mask-image: url(icons/runes-on);
			animation: bump 0.4s;
		}
	}

	@keyframes bump {
		0% {
			scale: 1;
		}
		50% {
			scale: 1.3;
		}
		100% {
			scale: 1;
		}
	}

	.popup {
		position: absolute;
		right: -4rem;
		width: 100vw;
		max-width: 320px;
		z-index: 9999;
		background: var(--sk-bg-3);
		padding: 1em;
		border-radius: var(--sk-border-radius);

		p {
			font: var(--sk-font-ui-medium);
		}
	}

	.popup p:first-child {
		margin-top: 0;
	}

	.popup p:last-child {
		margin-bottom: 0;
	}
</style>
