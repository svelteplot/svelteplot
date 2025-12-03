<script module>
    export const title = 'Group mean summary';
    export const description =
        'Uses the <a href="/transforms/group">groupZ</a> transform to add a mean summary line along the y-axis for each facet.';
    export const data = { penguins: '/data/penguins.csv' };
    export const transforms = ['group'];
</script>

<script lang="ts">
    import { Plot, Dot, RuleY, groupZ } from 'svelteplot';
    let { penguins } = $props();
</script>

<Plot frame grid marginTop={35}>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fx="species"
        opacity={0.35} />
    <RuleY
        {...groupZ(
            {
                data: penguins,
                y: 'culmen_depth_mm',
                fx: 'species'
            },
            { y: 'mean' }
        )}
        strokeWidth={2} />
</Plot>
