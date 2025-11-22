<script module>
    export let title = 'Shuffled Bars';
    export const transforms = ['sort'];
    export const data = { alphabet: '/data/alphabet.csv' };
</script>

<script>
    import { Plot, BarY, RuleY, shuffle } from 'svelteplot';

    let { alphabet } = $props();
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
