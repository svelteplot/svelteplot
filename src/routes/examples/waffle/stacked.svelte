<script module>
    export let title = 'Stacked waffle';
    export let sortKey = 5;
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
        {...groupX(
            {
                data: penguins,
                x: 'island',
                fill: 'species'
            },
            { y: 'count' }
        )} />
</Plot>
