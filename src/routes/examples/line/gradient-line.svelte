<script module>
    export const title = 'Gradient line';
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        LinearGradientX
    } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot x={{ grid: true }}>
    <defs>
        <LinearGradientX
            id="gradient-line-x"
            stops={[
                {
                    x: new Date(2014, 0, 1),
                    color: 'cyan'
                },
                {
                    x: new Date(2016, 0, 1),
                    color: 'magenta'
                },

                {
                    x: new Date(2018, 0, 1),
                    color: 'gold'
                }
            ]} />
    </defs>
    <Line
        data={aapl}
        x="Date"
        y="Close"
        stroke="url(#gradient-line-x)" />
</Plot>
