<script module>
    export const title = 'Faceted regression';

    export const description =
        'Regression lines grouped by a categorical variable, with different colors for each group.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script>
    import { Plot, Dot, RegressionY } from 'svelteplot';
    let { penguins } = $props();
</script>

<Plot grid frame aspectRatio={1} inset={5}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="#999"
        opacity={0.2} />
    <Dot
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        fill="species" />
    <RegressionY
        data={penguins}
        x="culmen_length_mm"
        fx="species"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
