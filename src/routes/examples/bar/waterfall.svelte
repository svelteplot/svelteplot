<script module>
    export const title = 'Waterfall-ish';
    export const fullCode = true;
    export const description =
        'A bar chart that mimics a waterfall chart by using two y-values for each bar.';
    export const repl =
        'https://svelte.dev/playground/d976166117a24704860a92b131f94a13?version=latest';
</script>

<script lang="ts">
    import { Plot, BarY } from 'svelteplot';

    const data = [7, 9, 11, 8, 6, 5, 11, 9, 7, 3, 4, 6].map(
        (d, i) => ({
            month: i,
            value: d
        })
    );
</script>

<Plot
    x={{
        tickFormat: (d) =>
            'JFMAMJJASOND'.charAt(d as number),
        label: false
    }}
    y={{ grid: true }}>
    <BarY
        {data}
        sort={false}
        x="month"
        y1={(d, i) => data[i - 1]?.value ?? 0}
        y2="value"
        fill={(d, i) =>
            i === 0
                ? 'gray'
                : d.value > data[i - 1]?.value
                  ? 'var(--svp-blue)'
                  : 'var(--svp-red)'} />
</Plot>
