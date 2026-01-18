<script module>
    export const title = 'Running mean';
    export const description =
        'A line plot showing the running mean of stock closing prices over time.';
    export const sortKey = 40;
    export const transforms = ['window', 'bin', 'select'];
    export const fullCode = true;
    export const data = { stocks: '/data/stocks.csv' };
    export const repl =
        'https://svelte.dev/playground/0f476e86418f4b1a84f25a6b529b04ec?version=latest';
</script>

<script lang="ts">
    import {
        binX,
        Line,
        Plot,
        RectX,
        selectLast,
        Text,
        windowY
    } from 'svelteplot';
    import type { StocksRow } from '../types';

    let { stocks }: { stocks: StocksRow[] } = $props();

    let smoothed = $derived(
        windowY(
            {
                data: stocks,
                x: 'Date',
                y: 'Close',
                z: 'Symbol'
            },
            { k: 5 }
        )
    );
</script>

<Plot grid y={{ type: 'log', base: 5 }} marginRight={75}>
    <RectX
        {...binX(
            {
                data: stocks,
                x: 'Date',
                y1: 'Low',
                y2: 'High',
                fill: 'Symbol'
            },
            { y1: 'min', y2: 'max', interval: '2 weeks' }
        )}
        opacity="0.4"
        strokeWidth="1.5" />
    <Line
        {...smoothed}
        stroke="Symbol"
        strokeWidth="2"
        markerEnd="dot" />
    <Text
        {...selectLast(smoothed)}
        fill="Symbol"
        text="Symbol"
        dx="10"
        textAnchor="start" />
</Plot>
