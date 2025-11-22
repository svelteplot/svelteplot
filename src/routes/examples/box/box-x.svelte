<script module>
    export const title = 'BoxX';
    export const description =
        "Box plot of Olympic athletes' weights across different sports.";
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, BoxX } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
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
