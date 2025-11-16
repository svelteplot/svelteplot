<script module>
    export const title = 'Faceted Pointer (2)';
    export const repl =
        'https://svelte.dev/playground/5b5a1383b5124896bd5fa1c6b7a2ada6?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        Line,
        RuleX,
        Dot,
        Text,
        Pointer,
        normalizeY
    } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    import Frame from 'svelteplot/marks/Frame.svelte';
    import type { DataRecord } from 'svelteplot/types';
    let { stocks } = $derived(
        page.data.data
    ) as ExamplesData;
    let stocks2 = $derived(
        stocks.filter((d) => d.Date < new Date(2018, 0, 1))
    );
    let selection: DataRecord[] = $state([]);

    const normalized = $derived(
        normalizeY<DataRecord>(
            {
                data: stocks2,
                x: 'Date',
                y: 'Close',
                fy: 'Symbol'
            },
            'extent'
        )
    );
</script>

<Plot y={{ axis: false }} marginTop={10} inset={4}>
    <Frame
        fill="currentColor"
        stroke={false}
        fillOpacity={0.02} />
    <Line
        {...normalized}
        opacity={selection.length > 0 ? 0.4 : 1}
        stroke="Symbol" />
    <Pointer
        {...normalized}
        y={null}
        onupdate={(e) => (selection = e)} />
    <RuleX
        data={selection.slice(0, 1)}
        x="Date"
        opacity={0.2} />
    <Text
        data={selection}
        fill="Symbol"
        stroke="var(--svelteplot-bg)"
        strokeWidth={3}
        x="Date"
        y="__y"
        fy="Symbol"
        text={(d) => d.Close.toFixed()}
        lineAnchor="bottom"
        fontWeight="bold"
        dy={-3} />
    <Dot
        data={selection}
        x="Date"
        y="__y"
        fy="Symbol"
        fill="Symbol"
        strokeWidth={0.7}
        stroke="var(--svelteplot-bg)" />
</Plot>
