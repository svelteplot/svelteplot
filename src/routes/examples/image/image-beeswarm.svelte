<script module>
    export const title = 'Image beeswarm';
    export const sortKey = 30;
    export const transforms = ['dodge'];
</script>

<script lang="ts">
    import { Plot, Image } from 'svelteplot';
    import { page } from '$app/state';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    import type { ExamplesData } from '../types';
    const { presidents2 } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 8e3}
    y={{ axis: false }}
    inset={20}>
    <Image
        data={presidents2}
        x="First Inauguration Date"
        dodgeY="bottom"
        y={0.01}
        src="Portrait URL"
        title="Name"
        r={20} />
</Plot>
