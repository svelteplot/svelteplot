<script module>
    export let title = 'Stacked Bars';
    export let sortKey = 2;
    export let transforms = ['group'];
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/d46987fc312f4e6a9b045c4e3be7e845?version=latest';
</script>

<script>
    import { Plot, BarY, RuleY, groupX } from 'svelteplot';

    let { penguins } = $props();
</script>

<Plot x={{ axis: 'top' }} color={{ legend: true }}>
    <RuleY data={[0]} />
    <BarY
        {...groupX(
            {
                data: penguins,
                x: 'island',
                fill: 'species'
            },
            { y: 'count' }
        )} />
</Plot>
