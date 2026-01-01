<script module>
    export const title = 'Explicit frame';
    export const repl =
        'https://svelte.dev/playground/0e2f588180a247daa574bb15fc6a40b9?version=latest';
</script>

<script>
    import { Frame, Plot } from 'svelteplot';
</script>

<Plot
    inset={10}
    height={400}
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 10] }}>
    <Frame strokeWidth={3} stroke="crimson" />
</Plot>
