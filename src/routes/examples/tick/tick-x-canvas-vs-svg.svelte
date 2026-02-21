<script module>
    export const title = 'Barcode plot (canvas vs SVG)';
    export const description =
        'TickX supports canvas rendering. This example compares canvas and SVG output side-by-side. Based on an example from <a href="https://observablehq.com/@observablehq/plot-barcode">Observable Plot</a>.';
    export const data = { stateage: '/data/stateage.csv' };
    export const sortKey = 21;
</script>

<script lang="ts">
    import { Plot, RuleX, TickX } from 'svelteplot';

    type StateAgeRow = {
        age: string;
        pop_share: number;
    };

    let { stateage }: { stateage: StateAgeRow[] } =
        $props();

    let ageDomain = $derived([
        ...new Set(stateage.map((d) => d.age))
    ]);
</script>

<div class="container">
    <div class="two-cols">
        <Plot
            title="Canvas ticks"
            x={{ grid: true, percent: true }}
            y={{ domain: ageDomain }}>
            <RuleX data={[0]} />
            <TickX
                canvas
                data={stateage}
                y="age"
                x="pop_share" />
        </Plot>

        <Plot
            title="SVG ticks"
            x={{ grid: true, percent: true }}
            y={{ domain: ageDomain }}>
            <RuleX data={[0]} />
            <TickX data={stateage} y="age" x="pop_share" />
        </Plot>
    </div>
</div>
