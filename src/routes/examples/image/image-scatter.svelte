<script module>
    export let title = 'Image scatterplot';
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

<Plot grid inset={20}>
    <RuleY y={0} />
    <Image
        data={presidents2}
        x="First Inauguration Date"
        y={(d) =>
            d['Very Favorable %'] +
            d['Somewhat Favorable %'] -
            d['Very Unfavorable %'] -
            d['Somewhat Unfavorable %']}
        src="Portrait URL"
        width={30} />
</Plot>
