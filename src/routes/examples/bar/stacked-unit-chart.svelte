<script module>
    export let title = 'Stacked Unit Chart';
    export let description =
        'A stacked unit chart making use of the implicit stack transform in the bar mark.';
    export const transforms = ['stack'];
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script>
    import { BarX, Plot } from 'svelteplot';
    import { useDark } from 'svelteplot/ui/isDark.svelte';

    const ds = useDark();
    let { penguins } = $props();
</script>

<Plot
    marginLeft={60}
    x={{ label: 'Frequency →' }}
    y={{ label: undefined }}
    color={{
        legend: true,
        scheme: ds.isDark ? 'magma' : 'reds'
    }}>
    <BarX
        data={penguins}
        y="species"
        fill="body_mass_g"
        sort="body_mass_g"
        x={1}
        insetLeft={1} />
</Plot>
