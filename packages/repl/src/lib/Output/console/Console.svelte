<script lang="ts">
	import ConsoleLine from './ConsoleLine.svelte';
	import type { Log } from './Log.svelte';

	export let logs: Log[];
</script>

<div class="container">
	{#each logs as log}
		<ConsoleLine {log} />
	{/each}
</div>

<style>
	.container {
		--error-fg: #da106e;
		--error-bg: #fff0f0;
		--error-border: rgb(242, 214, 219);
		--warning-bg: rgb(254, 251, 218);
		--warning-border: rgb(242, 232, 163);
		--json-tree-string-color: var(--shiki-token-string);
		--json-tree-font-family: var(--sk-font-family-mono);
		--json-tree-font-size: 1.2rem;
		--json-tree-li-line-height: 1.5;

		:root.dark & {
			--error-fg: rgb(235, 78, 109);
			--error-bg: rgb(71, 48, 54);
			--error-border: rgb(109, 65, 76);
			--warning-bg: rgb(64, 56, 34);
			--warning-border: rgb(86, 86, 51);

			--json-tree-property-color: #72a2d3;
			--json-tree-string-color: #6cd1c7;
			--json-tree-symbol-color: #6cd1c7;
			--json-tree-boolean-color: #9681f7;
			--json-tree-function-color: #e59b6f;
			--json-tree-number-color: #9681f7;
			--json-tree-label-color: #9ca0a5;
			--json-tree-arrow-color: #e8eaed;
			--json-tree-null-color: #81868a;
			--json-tree-undefined-color: #81868a;
			--json-tree-date-color: #9ca0a5;
			--json-tree-operator-color: #e8eaed;
			--json-tree-regex-color: #6cd1c7;
		}

		:global {
			p,
			ol,
			ul {
				font: var(--json-tree-font-family);
				font-size: var(--json-tree-font-size);
				line-height: 1.5;
			}
		}
	}
</style>
