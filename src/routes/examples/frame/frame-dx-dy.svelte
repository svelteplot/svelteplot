<script module>
    export const title = 'Frame with dx and dy';
    export const repl =
        'https://svelte.dev/playground/38c7fe8c22b64892b886841f3892464a?version=latest';
</script>

<script>
    import { Frame, Plot } from 'svelteplot';
</script>

<Plot
    marginRight={20}
    height={400}
    x={{ domain: [0, 10] }}
    y={{ domain: [0, 10] }}>
    <Frame
        dx={6}
        dy={6}
        strokeWidth={2}
        stroke="orange"
        opacity={0.2} />
    <Frame
        dx={3}
        dy={3}
        strokeWidth={2}
        stroke="green"
        opacity={0.4} />
    <Frame strokeWidth={2} stroke="crimson" />
</Plot>
