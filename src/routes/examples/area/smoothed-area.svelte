<script module>
    export const title = 'Area with rolling mean';
    export const description =
        'An area chart showing daily high and low temperatures with smoothed rolling window lines. Based on an example from <a href="https://observablehq.com/@observablehq/plot-window-line-area">Observable Plot</a>.';
    export const transforms = ['window'];
    export const data = { sftemp: '/data/sftemp.csv' };
    export const repl =
        'https://svelte.dev/playground/1ebfd73017f74970866d24f1f05979ec?version=latest';
</script>

<script lang="ts">
    import { Plot, AreaY, Line, windowY } from 'svelteplot';

    let { sftemp } = $props();

    let k = $state(20);
    let reduce = $state('mean');
    let anchor = $state('middle');
    let strict = $state(false);

    let niceReduce = $derived(
        {
            min: 'minimum',
            max: 'maximum',
            mean: 'average',
            p01: '1-percentile',
            p25: '25-percentile',
            p75: '75-percentile',
            p99: '99-percentile'
        }[reduce] || reduce
    );

    const REDUCE_OPTIONS = [
        'mean',
        'median',
        // 'mode',
        'p01',
        'p25',
        'p75',
        'p99',
        'min',
        'max'
        // 'deviation',
        // 'variance',
        // 'ratio',
        // 'difference'
    ].sort();
</script>

<Plot inset={5}>
    <AreaY
        data={sftemp}
        x="date"
        y1="low"
        y2="high"
        opacity="0.2" />
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'low' },
            { k, anchor, strict, reduce }
        )}
        stroke="var(--svp-blue)" />
    <Line
        {...windowY(
            { data: sftemp, x: 'date', y: 'high' },
            { k, anchor, strict, reduce }
        )}
        stroke="var(--svp-red)" />
    <AreaY
        {...windowY(
            {
                data: sftemp,
                x: 'date',
                y1: 'high',
                y2: 'low'
            },
            { k, anchor, strict, reduce }
        )}
        fillOpacity={0.15}
        fill="yellow"
        mixBlendMode="multiply" />
</Plot>
