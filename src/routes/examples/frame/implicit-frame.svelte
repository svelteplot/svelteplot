<script module>
    export const title = 'Implicit frame';
    export const description =
        'A Plot with the frame option creates an implicit frame.';
    export const repl =
        'https://svelte.dev/playground/9a0f848d41a7404ea636ffbbe8902831?version=latest';
</script>

<script>
    import { Plot } from 'svelteplot';
</script>

<Plot
    frame
    inset={10}
    height={400}
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 10] }}>
</Plot>
