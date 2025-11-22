<script module>
    export let title = 'Stacked WaffleX';
    export let sortKey = 5;
    export let transforms = ['group'];
    export let repl =
        'https://svelte.dev/playground/bfcc3c72808e4406a795884af8207d12?version=5';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script>
    import { Plot, WaffleX, groupY } from 'svelteplot';

    let { penguins } = $props();
</script>

<Plot
    height={400}
    x={{ grid: true }}
    color={{ legend: true }}>
    <WaffleX
        gap={2}
        borderRadius={2}
        {...groupY(
            {
                data: penguins,
                y: 'island',
                fill: 'species'
            },
            { x: 'count' }
        )} />
</Plot>
