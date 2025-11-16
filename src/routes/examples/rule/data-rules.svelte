<script module>
    export const title = 'Data rules';
    export const description =
        'Note that you probably want to use TickY instead of a faceted RuleY.';
</script>

<script lang="ts">
    import { Plot, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { aapl } = $derived(page.data.data) as ExamplesData;

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
