<script module>
    export let title = 'Stacked Unit Chart';
</script>

<script>
    import { BarX, Plot, RuleX } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    marginLeft={60}
    x={{ label: 'Frequency →' }}
    y={{ label: undefined }}
    color={{ legend: true }}>
    <BarX
        data={penguins}
        y="species"
        x={1}
        stack={{ offset: 'normalize' }}
        fill="island"
        insetLeft={1} />
</Plot>
