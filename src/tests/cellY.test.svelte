<script lang="ts">
	import { CellY, Plot } from '$lib/index.js';
	import type { ComponentProps } from 'svelte';

	interface Props {
		plotArgs: ComponentProps<typeof Plot>;
		cellArgs: ComponentProps<typeof CellY>;
	}

	let { plotArgs, cellArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
	<CellY {...cellArgs} />
</Plot>
