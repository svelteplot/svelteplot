<script module>
    export const title = 'Tick classes';
    export const repl =
        'https://svelte.dev/playground/d949e2daf18a4e1ba98ed1a2e52d9198?version=latest';
</script>

<script lang="ts">
    import { Plot, AxisX } from 'svelteplot';
</script>

<Plot marginTop={30} x={{ domain: [-100, 100] }}>
    <AxisX
        tickClass={(d: number) =>
            d < 0 ? 'negative' : 'positive'} />
</Plot>

<style>
    :global {
        .tick.negative {
            color: var(--svp-red) !important;
        }
        .tick.positive {
            color: var(--svp-blue) !important;
        }
    }
</style>
