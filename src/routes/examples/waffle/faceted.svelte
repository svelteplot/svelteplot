<script module>
    export let title = 'Faceted waffle';
    export let sortKey = 15;
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, WaffleY, groupX } from 'svelteplot';
    let { olympians } = $props();
</script>

<Plot
    x={{
        type: 'band',
        tickFormat: (d) => String((d as Date).getFullYear())
    }}>
    <WaffleY
        unit={10}
        {...groupX(
            {
                data: olympians,
                x: 'date_of_birth'
            },
            { y: 'count', interval: '5 years' }
        )} />
</Plot>
