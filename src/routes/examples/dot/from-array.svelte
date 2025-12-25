<script module>
    export const title = 'Dots from coordinates array';
    export const repl =
        'https://svelte.dev/playground/ffc5b17194d645ff9b3cc3ad79f65ecb?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import { range } from 'd3-array';
</script>

<Plot grid>
    <Dot
        data={range(-10, 11, 0.5).map((n) => [n, n ** 3])}
        fill />
</Plot>
