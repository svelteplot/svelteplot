<script module>
    export const title = 'Rug plot';
    export const description =
        'Axes with ticks that show the distribution of values, sometimes called a "rug plot". This is a style of axis advocated by Edward Tufte in his book <a href="https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/">The Visual Display of Quantitative Information</a>.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        Dot,
        AxisX,
        AxisY,
        RuleX
    } from 'svelteplot';
    import { extent } from 'd3-array';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();

    const billLengths = $derived(
        penguins.map((d) => d.bill_length_mm)
    );
    const bodyMasses = $derived(
        penguins.map((d) => d.body_mass_g)
    );
</script>

<Plot grid inset={15}>
    <!-- labeled ticks -->
    <AxisX />
    <AxisY />
    <!-- min/max ticks -->
    <AxisX data={extent(billLengths) as [number, number]} />
    <AxisY data={extent(bodyMasses) as [number, number]} />

    <!-- unlabeled value distribution ticks -->
    <AxisX tickSize={-5} data={billLengths} text={false} />
    <AxisY
        tickSize={-5}
        data={penguins.map((d) => d.body_mass_g)}
        text={false} />
    <Dot
        data={penguins}
        fill
        x="bill_length_mm"
        y="body_mass_g" />
</Plot>
