<script module>
    export let title = 'Shuffled Bars';
</script>

<script>
    import { Plot, BarY, RuleY, shuffle } from 'svelteplot';

    import { page } from '$app/state';
    let { alphabet } = $derived(page.data.data);

    let seed = $state(42);
</script>

<Plot
    grid
    y={{ percent: true }}
    x={{ sort: false }}
    marginTop={25}>
    <RuleY data={[0]} />
    <BarY
        {...shuffle(
            { data: alphabet, x: 'letter', y: 'frequency' },
            { seed }
        )} />
</Plot>
