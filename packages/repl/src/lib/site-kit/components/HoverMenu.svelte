<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="hover-menu">
	{@render children()}
</div>

<style>
	.hover-menu {
		padding: 0.5rem;
		white-space: nowrap;

		:global {
			a,
			button,
			label {
				color: inherit;
				padding: 1rem;
				display: block;
				font: var(--sk-font-ui-medium);
				text-decoration: none;
				line-height: 1;
				width: 100%;
				text-align: left;
				border-radius: var(--sk-border-radius-inner);

				&:not(:disabled):hover {
					background-color: var(--sk-bg-4);
				}
			}

			label {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 1rem;
			}

			button:disabled {
				color: var(--sk-fg-4);
			}
		}
	}
</style>
