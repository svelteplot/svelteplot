<script lang="ts">
    import { Plot, RuleX } from '$lib/index.js';
    import type { Datasets } from 'svelteplot/types/index.js';
    import { getContext } from 'svelte';
    import Code from '../../Code.svelte';

    let { code = false } = $props();

    const { aapl } = getContext<Datasets>('data');

    type AAPL = (typeof aapl)[0];
</script>

<Plot grid testid="candlestick">
    <RuleX data={aapl.slice(750, 800)} x="Date" y1="Low" y2="High" strokeWidth="2" opacity="0.3" />
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Open"
        y2="Close"
        strokeWidth="5"
        stroke={(d) => ((d as AAPL).Close > (d as AAPL).Open ? 'lightseagreen' : 'crimson')} />
</Plot>

{#if code}
    <Code
        code={`<Plot grid>
    <RuleX 
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Low"
        y2="High"
        strokeWidth="2"
        opacity="0.3" />
    <RuleX
        data={aapl.slice(750, 800)}
        x="Date"
        y1="Open"
        y2="Close"
        strokeWidth="5"
        stroke={(d) => d.Close > d.Open ? 'lightseagreen' : 'crimson'} />
</Plot>`} />
{/if}
