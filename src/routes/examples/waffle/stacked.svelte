<script module>
    export let title = 'Stacked waffle';
    export let sortKey = 5;
    export let transforms = ['group'];
    export let repl =
        'https://svelte.dev/playground/4ade8154c5fa4de5ba9981a616680ade?version=5';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script>
    import {
        Plot,
        WaffleY,
        RuleY,
        groupX
    } from 'svelteplot';

    let { penguins } = $props();
</script>

<Plot x={{ axis: 'top' }} color={{ legend: true }}>
    <RuleY data={[0]} />
    <WaffleY
        {...groupX(
            {
                data: penguins,
                x: 'island',
                fill: 'species'
            },
            { y: 'count' }
        )} />
</Plot>
