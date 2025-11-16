<script module>
    export const title = 'Grouped regression';

    export const description =
        'Regression lines grouped by a categorical variable, with different colors for each group.';
</script>

<script>
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot grid height={500} color={{ legend: true }}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
