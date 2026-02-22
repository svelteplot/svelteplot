<script module>
    export const title = 'Trail curves';
    export const fullCode = true;
    export const description =
        'This example shows different curve types and line cap styles for Trail marks.';
</script>

<script lang="ts">
    import { Plot, Trail, Line } from 'svelteplot';
    import type { CurveName } from 'svelteplot/types';

    const curves: CurveName[] = [
        'linear',
        'catmull-rom',
        'natural',
        'basis',
        'bump-x',
        'step-after'
    ];
    const caps: ('round' | 'butt')[] = ['round', 'butt'];

    const args = {
        data: [
            [1, 1, 0],
            [2, 2, 1],
            [3, 1, 3]
        ].map(([x, y, r]) => ({ x, y, r })),
        x: 'x',
        y: 'y',
        r: 'r'
    };
</script>

<Plot
    height={600}
    inset={20}
    x={{ axis: false }}
    y={{ axis: false }}
    r={{ range: [1, 20] }}
    fy={{ domain: curves }}
    fx={{ domain: caps }}>
    {#each caps as cap (cap)}
        {#each curves as curve (curve)}
            <Trail
                {...args}
                fy={curve}
                fx={cap}
                {cap}
                {curve}
                opacity={0.4} />
            <!-- line for reference -->
            <Line {...args} fy={curve} fx={cap} {curve} />
        {/each}
    {/each}
</Plot>
