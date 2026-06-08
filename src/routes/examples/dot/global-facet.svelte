<script module>
    export const title = 'Global facet options';
    export const description =
        'You can set global facet options on the <code>&lt;Plot&gt;</code> component, and override them on individual marks with <code>facet="exclude"</code>.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 101;
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
    facet={{
        data: penguins,
        x: 'sex',
        y: 'species'
    }}
    marginBottom={40}>
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm"
        r={1}
        facet="exclude"
        opacity={0.2} />
    <Dot
        data={penguins}
        x="bill_length_mm"
        y="bill_depth_mm" />
</Plot>
