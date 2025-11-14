<script module>
    export let title = 'Rounded waffles';
    export let sortKey = 10;
    export let transforms = ['group'];
</script>

<script>
    import {
        Plot,
        WaffleY,
        RuleY,
        groupX
    } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot x={{ axis: 'top' }} color={{ legend: true }}>
    <RuleY data={[0]} />
    <WaffleY
        gap={3}
        borderRadius={20}
        {...groupX(
            {
                data: penguins,
                x: 'island',
                stroke: 'species',
                fill: 'species',
                fillOpacity: 0.5
            },
            { y: 'count' }
        )} />
</Plot>
