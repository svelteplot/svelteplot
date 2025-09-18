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
    color={{ legend: true, scheme: 'reds' }}>
    <BarX
        data={penguins}
        y="species"
        fill="body_mass_g"
        sort="body_mass_g"
        x={1}
        insetLeft={1} />
</Plot>
