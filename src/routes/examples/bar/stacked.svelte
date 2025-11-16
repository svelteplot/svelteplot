<script module>
    export let title = 'Stacked Bars';
    export let sortKey = 2;
    export let transforms = ['group'];
</script>

<script>
    import { Plot, BarY, RuleY, groupX } from 'svelteplot';

    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
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
