<script module lang="ts">
    export let title = 'Cell Plot';
    export const description = `Ratings of Simpsons episodes, arranged by season. Based on an example from <a href="https://observablehq.com/@observablehq/plot-simpsons-ratings">Observable Plot</a>.`;
    export const data = { simpsons: '/data/simpsons.csv' };
</script>

<script lang="ts">
    import { Plot, Cell, Text } from 'svelteplot';
    import type { SimpsonsRow } from '../types';

    let { simpsons }: { simpsons: SimpsonsRow[] } =
        $props();
</script>

<Plot
    grid
    padding={0}
    aspectRatio={1}
    marginTop={40}
    x={{ type: 'band', axis: 'top' }}
    y={{ type: 'band' }}
    color={{ type: 'quantile', scheme: 'PiYG' }}>
    <Cell
        data={simpsons}
        x="episode"
        y="season"
        fill="imdb_rating"
        inset={0.5} />
    <Text
        data={simpsons}
        y="season"
        x="episode"
        fill="black"
        text={(d) =>
            d.imdb_rating != null
                ? d.imdb_rating.toFixed(1)
                : null}
        title={(d) => d.title} />
</Plot>
