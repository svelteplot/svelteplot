<script module>
    export const title = 'BoxX';
    export const description =
        "Box plot of Olympic athletes' weights across different sports.";
</script>

<script lang="ts">
    import { Plot, BoxX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { olympians } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    inset={10}
    x={{
        axis: 'both',
        grid: true,
        type: 'log'
    }}>
    <BoxX
        data={olympians}
        x="weight"
        y="sport"
        bar={{ fillOpacity: 0.5 }}
        tickMinMax />
</Plot>
