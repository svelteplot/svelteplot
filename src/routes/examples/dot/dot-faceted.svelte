<script module>
    export const title = 'Faceted scatterplots';
    export const description =
        'Scatterplot of culmen length vs. culmen depth for the <a href="https://allisonhorst.github.io/palmerpenguins/">Palmer Penguins dataset</a>, faceted';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 101;
    export const repl =
        'https://svelte.dev/playground/0523035dd3674b79918ff60bc008316d?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot
    frame
    grid
    height={600}
    inset={10}
    marginTop={35}
    marginBottom={40}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        r={2}
        opacity={0.1} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fy="species"
        fx="sex" />
</Plot>
