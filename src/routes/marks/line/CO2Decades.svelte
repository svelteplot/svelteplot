<script lang="ts">
    import { Plot, Line, Pointer, Text, RectY, RuleY, Dot, selectLast } from '$lib/index.js';
    import { range } from 'd3-array';
    import { page } from '$app/stores';

    const { co2 } = $derived($page.data.data);

    type CO2Decade = {
        date: Date;
        average: number;
        interpolated: number;
        decadeBaseYear: number;
        yearInDecade: number;
    };

    const co2decades = $derived(
        co2.map((d: { date: Date }) => {
            const y = d.date.getFullYear();
            const decadeBaseYear = y - (y % 10);
            const yearInDecade = y - decadeBaseYear + d.date.getMonth() / 12;
            return { ...d, decadeBaseYear, yearInDecade };
        }) as CO2Decade[]
    );

    const dateFormat = (date: Date) =>
        date.toLocaleString('default', { month: 'short', year: 'numeric' });
</script>

<Plot
    x={{
        label: 'Year in decade →',
        grid: true,
        ticks: range(1, 10)
    }}
    y={{ label: '↑ CO2 concentration (in ppm)' }}
    height={550}
    marginTop={25}
    marginBottom={35}
    marginRight={60}
    color={{
        scheme: ['#2f8fe3', '#a09ebc', '#c28b81', '#c06146', '#a62a1b'],
        type: 'linear'
    }}>
    <!-- grid -->
    <RectY
        data={range(310, 420, 20).map((low) => ({ low, high: low + 10 }))}
        y1="low"
        y2="high"
        opacity={0.05} />

    <!-- annotation -->
    <RuleY data={[350]} strokeWidth={3} opacity={0.2} />
    <Text
        data={[{ x: 0, y: 350, text: 'Sustainable level' }]}
        x="x"
        y="y"
        text="text"
        textAnchor="start"
        lineAnchor="top"
        dy={3}
        fontStyle="italic"
        opacity={0.5} />

    <!-- data -->
    <Line
        data={co2decades}
        markerStart="dot"
        markerEnd="dot"
        z="decadeBaseYear"
        x="yearInDecade"
        stroke="average"
        strokeWidth={1.7}
        y="average" />

    <!-- labels -->
    <Text
        {...selectLast({
            data: co2decades,
            x: 'yearInDecade',
            y: 'average',
            z: 'decadeBaseYear'
        }) as {
            x: string;
            y: string;
            z: string;
            data: CO2Decade[];
        }}
        text={(d) =>
            `${Math.max(d.decadeBaseYear, co2decades[0].date.getFullYear())}-'${String(Math.min(d.decadeBaseYear + 9, co2decades.at(-1).date.getFullYear())).substring(2)}`}
        textAnchor="start"
        dx={5}
        stroke="var(--svelteplot-bg)"
        strokeWidth={3}
        fill="average" />

    <Pointer data={co2decades} x="yearInDecade" z="decadeBaseYear">
        {#snippet children({ data })}
            <Dot {data} x="yearInDecade" y="average" fill="average" />
            <Text
                {data}
                x="yearInDecade"
                y="average"
                text={(d) => `${dateFormat(d.date)}\n${d.average.toFixed(0)}`}
                lineAnchor="bottom"
                fontWeight={(d) => (d.__tspanIndex ? 'bold' : 'normal')}
                dy={-5}
                stroke="var(--svelteplot-bg)"
                strokeWidth={3}
                fill="average" />
        {/snippet}
    </Pointer>
</Plot>
