<script module>
    export const title = 'Trail curves';
    export const fullCode = true;
    export const description =
        'This example shows different curve types and line cap styles for Trail marks.';
</script>

<script lang="ts">
    import { Plot, Trail, Text } from 'svelteplot';

    const curves = [
        'linear',
        'catmull-rom',
        'natural',
        'basis',
        'bump-x',
        'step-after'
    ];
    const caps = ['round', 'butt'];

    const data = [
        [1, 1, 0],
        [2, 2, 1],
        [3, 1, 3]
    ].map(([x, y, r]) => ({ x, y, r }));

    const args = { data, x: 'x', y: 'y', r: 'r' };
</script>

<Plot
    height={600}
    inset={20}
    x={{ axis: false }}
    y={{ axis: false }}
    r={{ range: [1, 20] }}
    fy={{ domain: curves }}
    fx={{ domain: caps }}>
    {#each caps as cap}
        {#each curves as curve}
            <Trail
                {...args}
                fy={curve}
                fx={cap}
                {cap}
                {curve} />
        {/each}
    {/each}
</Plot>
