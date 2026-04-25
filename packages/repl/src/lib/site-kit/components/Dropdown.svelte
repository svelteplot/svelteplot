<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		dropdown,
		align = 'left'
	}: { children: Snippet; dropdown: Snippet; align?: 'left' | 'right' } = $props();
</script>

<div class="dropdown">
	{@render children()}

	<nav class="dropdown-content" class:align-right={align === 'right'}>
		{@render dropdown()}
	</nav>
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
		height: 100%;
	}

	.dropdown-content {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		left: -1rem;
		/* this is a bit of a kludge, but it ensures a contiguous hit area (50% + 50%) while also working for tall links like `Docs` (50% + 1.5rem) */
		top: calc(50% + min(50%, 1.5rem));
		background-color: var(--sk-bg-2);
		z-index: 1;
		filter: var(--sk-shadow);
		border-radius: var(--sk-border-radius);
		z-index: 999;
		transform: var(--safari-fix);
		-webkit-transform: var(--safari-fix);
		will-change: opacity;

		&.align-right {
			left: auto;
			right: -1rem;
		}
	}

	.dropdown:hover .dropdown-content,
	.dropdown:focus-within .dropdown-content {
		opacity: 1;
		pointer-events: all;
	}
</style>
