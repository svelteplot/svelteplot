<script>
	import V0 from './v0.svelte';
</script>

<V0 />

<!-- <script lang="ts">
	import Repl from '$lib/Repl.svelte';
	import { onMount } from 'svelte';
	import '@sveltejs/site-kit/styles/index.css';

	let repl: ReturnType<typeof Repl>;

	onMount(() => {
		repl.set({
			files: [
				{
					type: 'file',
					name: 'App.svelte',
					basename: 'App.svelte',
					contents:
						'<script>\n\tlet count = $state(0);\n\n\tfunction increment() {\n\t\tcount += 1;\n\t}\n</scr' +
						'ipt>\n\n<button onclick={increment}>\n\tclicks: {count}\n</button>',
					text: true
				}
			]
		});
	});
</script>

<main>
	<Repl bind:this={repl} />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		height: 100vh;
	}
</style> -->
