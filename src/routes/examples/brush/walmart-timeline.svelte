<script module lang="ts">
    export const title = 'Walmart store timeline';
    export const description =
        'A state basemap with Walmart store openings linked to a cumulative timeline.';
    export const sortKey = 30;
    export const data = {
        statesTopo: '/data/us-states.json',
        walmart: '/data/walmart.csv'
    };
</script>

<script lang="ts">
    import {
        Plot,
        Geo,
        Dot,
        Text,
        Line,
        AreaY,
        RuleY,
        BrushX
    } from 'svelteplot';
    import * as topojson from 'topojson-client';
    import type { ExamplesData } from '../types';

    type StateProperties = {
        CENSUSAREA: number;
        STUSPS: string;
        /** centroid x coordinate */
        cx: number;
        /** centroid y coordinate */
        cy: number;
    };

    const { statesTopo, walmart } =
        $props() as ExamplesData;

    const states = $derived(
        (
            topojson.feature(
                statesTopo,
                statesTopo.objects.states
            ) as GeoJSON.FeatureCollection<
                GeoJSON.Geometry,
                StateProperties
            >
        ).features
    );
    const land = $derived(
        topojson.feature(
            statesTopo,
            statesTopo.objects.land
        )
    );
    const innerBorders = $derived(
        topojson.feature(
            statesTopo,
            statesTopo.objects.innerborders
        )
    );

    const labelStates = $derived(
        states.filter(
            (d) => d.properties?.CENSUSAREA > 24000
        )
    );

    const sortedWalmart = $derived(
        [...walmart].sort(
            (a, b) =>
                a.opendate.getTime() - b.opendate.getTime()
        )
    );
    const cumulative = $derived.by(() => {
        let count = 0;
        return sortedWalmart.map((d) => ({
            ...d,
            count: ++count
        }));
    });

    const startDate = new Date(1972, 0, 1);
    const endDate = new Date(1990, 0, 1);

    let brush = $state({
        enabled: true,
        x1: startDate,
        x2: endDate
    });

    const filteredWalmart = $derived.by(() => {
        if (!brush.enabled) {
            return walmart;
        }
        return walmart.filter(
            (d) =>
                d.opendate >= brush.x1 &&
                d.opendate <= brush.x2
        );
    });

    const labelFormatter = new Intl.DateTimeFormat(
        'en-US',
        {
            month: 'short',
            year: 'numeric'
        }
    );
    const brushLabel = $derived(
        `${labelFormatter.format(brush.x1)} - ${labelFormatter.format(brush.x2)}`
    );
</script>

<div class="walmart-geo">
    <Plot
        title={brushLabel}
        projection="albers-usa"
        height={420}
        color={{
            scheme: 'plasma',
            reverse: true,
            legend: false
        }}>
        <Geo
            data={[land]}
            canvas
            fill="lightgray"
            fillOpacity={0.07}
            stroke="currentColor"
            strokeWidth={1} />
        <Geo
            data={[innerBorders]}
            stroke="currentColor"
            strokeOpacity={0.44}
            strokeWidth={0.5} />
        <Text
            data={labelStates}
            x={(d) => d.properties.cx}
            y={(d) => d.properties.cy}
            text={(d) => d.properties.STUSPS}
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.32}
            textAnchor="middle"
            lineAnchor="middle" />
        <Dot
            data={filteredWalmart}
            x="lon"
            y="lat"
            fill="opendate"
            r={2}
            canvas />
    </Plot>

    <div class="timeline" style="touch-action: none">
        <Plot
            height={160}
            y={{ axis: false }}
            marginBottom={30}>
            <AreaY
                data={cumulative}
                filter={(d) =>
                    d.opendate >= brush.x1 &&
                    d.opendate < brush.x2}
                x="opendate"
                y1={0}
                y2="count"
                fill="currentColor"
                fillOpacity={0.3}
                canvas />
            <Line
                data={cumulative}
                x="opendate"
                y="count"
                canvas />
            <RuleY y={0} />
            <BrushX bind:brush constrainToDomain />
        </Plot>
    </div>
</div>

<style>
    .walmart-geo {
        display: grid;
        gap: 1rem;
        align-items: center;
        :global(h2) {
            text-align: center;
        }
    }
</style>
