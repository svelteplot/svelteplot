<script module>
    export const title = 'Data rules (canvas)';
    export const description =
        "Rule marks support canvas rendering. Here's the output side by side:";
    export const data = { aapl: '/data/aapl.csv' };
    export const sortKey = 21;
</script>

<script lang="ts">
    import { Plot, RuleY } from 'svelteplot';
    import type { AaplRow } from '../types';
    let { aapl }: { aapl: AaplRow[] } = $props();

    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
</script>

<div class="container">
    <div class="two-cols">
        <Plot
            inset={10}
            title="Canvas rules"
            y={{ grid: true }}
            fx={{ axis: 'bottom', padding: 0 } as any}>
            <RuleY
                data={aapl.slice(0, 150)}
                y="Close"
                inset={5}
                canvas
                fx={(d) => monthNames[d.Date.getMonth()]} />
        </Plot>
        <Plot
            inset={10}
            title="SVG rules"
            y={{ grid: true }}
            fx={{ axis: 'bottom', padding: 0 } as any}>
            <RuleY
                data={aapl.slice(0, 150)}
                y="Close"
                inset={5}
                fx={(d) => monthNames[d.Date.getMonth()]} />
        </Plot>
    </div>
</div>
