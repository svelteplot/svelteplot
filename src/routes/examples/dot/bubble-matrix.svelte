<script module>
    export let title = 'Bubble matrix';
</script>

<script>
    import { Plot, Dot, group } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    marginLeft={60}
    height={240}
    grid
    color={{ legend: true }}
    r={{ range: [0, 40] }}>
    <Dot
        {...group(
            {
                data: penguins,
                x: 'species',
                y: 'island',
                stroke: 'sex'
            },
            { r: 'count' }
        )} />
</Plot>
