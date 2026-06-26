<script lang="ts">
    import { Plot, AreaY } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        width?: number;
        scale?: number;
        tickRotate?: number;
    }

    let { width = 400, scale = 1.3, tickRotate = 0 }: Props = $props();

    const areaArgs: ComponentProps<typeof AreaY> = {
        data: [
            { date: new Date('2020-01-01'), value: 10 },
            { date: new Date('2020-06-01'), value: 50 },
            { date: new Date('2021-01-01'), value: 30 }
        ],
        x: 'date',
        y: 'value'
    };
</script>

<div style="transform: scale({scale})">
    <Plot {width} height={200} x={{ type: 'utc', tickRotate }} y={{ domain: [0, 100] }}>
        {#snippet children({ options })}
            <text data-testid="margin-probe-left" x={0} y={0}>{options.marginLeft}</text>
            <text data-testid="margin-probe-bottom" x={0} y={12}>{options.marginBottom}</text>
            <AreaY {...areaArgs} />
        {/snippet}
    </Plot>
</div>