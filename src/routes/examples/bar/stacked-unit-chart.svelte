<script module>
    export let title = 'Stacked Unit Chart';
</script>

<script>
    import { BarX, Plot } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    marginLeft={60}
    x={{ label: 'Frequency →' }}
    y={{ label: null }}
    color={{ legend: true }}>
    <BarX
        data={penguins}
        y="species"
        x={1}
        inset={0.5}
        fill="body_mass_g"
        sort="body_mass_g" />
    <RuleX data={[0]} />
</Plot>
