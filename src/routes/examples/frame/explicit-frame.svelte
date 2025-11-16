<script module>
    export const title = 'Explicit frame';
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
