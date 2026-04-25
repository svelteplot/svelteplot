<!-- This component should be the entry point when compiling the REPL as a SvelteKit app for the v0 preview window -->
<script lang="ts">
	import Repl from '$lib/Repl.svelte';
	import { onMount } from 'svelte';
	import '@sveltejs/site-kit/styles/index.css';

	let repl: ReturnType<typeof Repl>;

	onMount(() => {
		// @ts-expect-error so that v0 can interact with the REPL (it does load this SvelteKit app inline in its Next.js app)
		window.__svelte_repl = repl;
	});
</script>

<main>
	<Repl
		bind:this={repl}
		embedded="output-only"
		onerror={(error) => {
			// @ts-expect-error so that v0 can react to REPL errors
			window.__svelte_repl_onerror?.(error);
		}}
	/>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		height: 100vh;
	}
</style>
