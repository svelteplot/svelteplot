<script module>
    export const title = 'Dots from number array';
    export const repl =
        'https://svelte.dev/playground/8b3408bf45e64bd19cfa738687e2a1ca?version=latest';
</script>

<script lang="ts">
    import { Plot, DotX } from 'svelteplot';
    import { range } from 'd3-array';
</script>

<Plot grid inset={20}>
    <DotX data={range(-10, 11).map((d) => d ** 3)} fill />
</Plot>
