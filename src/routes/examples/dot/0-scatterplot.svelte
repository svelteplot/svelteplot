<script module>
    export let title = 'Scatterplot';
</script>

<script>
    import { Plot, Dot, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    let { penguins } = $derived(page.data.data);
</script>

<Plot>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm" />
</Plot>
