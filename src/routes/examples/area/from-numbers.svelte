<script module>
    export const title = 'Area from numbers';
    export const description =
        'An area chart created from a simple array of numbers, demonstrating how to visualize numerical data using area marks.';
</script>

<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';
</script>

<Plot grid>
    <AreaY data={[1.5, 2, 3.5, 2.5, 5.5, 8.5, 6]} />
</Plot>
