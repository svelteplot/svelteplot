<script lang="ts">
    import { CustomMark, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    type Props = Omit<ComponentProps<typeof CustomMark>, 'mark' | 'marks'> & {
        mode?: 'mark' | 'marks';
    };

    let { mode = 'mark', ...args }: Props = $props();
</script>

<Plot width={100} height={100} axes={false}>
    {#if mode === 'marks'}
        <CustomMark {...args}>
            {#snippet marks({ records })}
                {#each records as record, i (i)}
                    <rect
                        class="custom-rect"
                        data-index={i}
                        data-x={record.x}
                        data-y={record.y}
                        data-x1={record.x1}
                        data-x2={record.x2}
                        data-y1={record.y1}
                        data-y2={record.y2}
                        data-r={record.r}
                        data-fill={record.fill}
                        data-stroke={record.stroke}
                        data-opacity={record.opacity} />
                {/each}
            {/snippet}
        </CustomMark>
    {:else}
        <CustomMark {...args}>
            {#snippet mark({ record, index })}
                <circle
                    class="custom-circle"
                    data-index={index}
                    data-x={record.x}
                    data-y={record.y}
                    data-x1={record.x1}
                    data-x2={record.x2}
                    data-y1={record.y1}
                    data-y2={record.y2}
                    data-r={record.r}
                    data-fill={record.fill}
                    data-stroke={record.stroke}
                    data-opacity={record.opacity} />
            {/snippet}
        </CustomMark>
    {/if}
</Plot>
