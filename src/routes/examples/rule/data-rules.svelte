<script module>
    export const title = 'Data rules';
    export const description =
        'Note that you probably want to use TickY instead of a faceted RuleY.';
    export const data = { aapl: '/data/aapl.csv' };
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

<Plot inset={10}>
    <RuleY
        data={aapl.slice(0, 150)}
        y="Close"
        fx={(d) => monthNames[d.Date.getMonth()]} />
</Plot>
