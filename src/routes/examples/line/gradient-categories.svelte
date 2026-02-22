<script module>
    export const title = 'Gradient from categories';
</script>

<script>
    import {
        Plot,
        Dot,
        Line,
        LinearGradientX
    } from 'svelteplot';

    // Sample data
    const data = [
        { x: 0, y: 0, category: 'A' },
        { x: 1, y: 1.5, category: 'A' },
        { x: 2, y: 1, category: 'B' },
        { x: 3, y: 2.5, category: 'C' },
        { x: 4, y: 2.0, category: 'D' }
    ];

    const scheme = {
        A: 'red',
        B: 'blue',
        C: 'orange',
        D: 'lime'
    };

    const stops = $derived(
        data.map(({ x, category }) => ({
            x,
            color: scheme[category]
        }))
    );
</script>

<Plot color={{ scheme }} grid>
    <defs>
        <LinearGradientX id="my-gradient" {stops} />
    </defs>
    <Line
        {data}
        x="x"
        y="y"
        strokeWidth={2}
        stroke="url(#my-gradient)" />
    <Dot
        {data}
        x="x"
        y="y"
        fill="category"
        r={4}
        stroke="var(--svelteplot-bg)" />
</Plot>
