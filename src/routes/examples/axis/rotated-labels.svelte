<script module>
    export const title = 'Rotated axis labels';
    export const sortKey = 30;
    export const repl =
        'https://svelte.dev/playground/32f35494eaa643b18364c6316c4565d8?version=latest';
</script>

<script lang="ts">
    import { Plot } from 'svelteplot';
</script>

<Plot
    marginBottom={50}
    x={{
        tickRotate: 45,
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
