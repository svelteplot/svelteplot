<script module>
    export let title = 'Symbol channel';
</script>

<script>
    import { Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot
    grid
    x={{ label: 'Body mass (g) →' }}
    y={{ label: '↑ Flipper length (mm)' }}
    symbol={{ legend: true }}>
    <Dot
        data={penguins}
        x="body_mass_g"
        y="flipper_length_mm"
        stroke="species"
        symbol="species" />
</Plot>
