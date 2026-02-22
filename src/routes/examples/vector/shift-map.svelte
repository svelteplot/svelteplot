<script module lang="ts">
    export const title = 'Shift map';
    export const description =
        'Uses projected county centroids and vector arrows to show the direction and magnitude of 2020 election shifts.';
    export const data = {
        us: '/data/us-counties-10m.json',
        election: '/data/election.csv'
    };
</script>

<script lang="ts">
    import {
        Plot,
        Geo,
        Vector,
        geoCentroid
    } from 'svelteplot';
    import * as topojson from 'topojson-client';

    type ElectionDatum = {
        fips: number;
        margin2020?: number;
        votes?: number;
    };

    type CountyFeature = {
        id?: string | number;
        properties?: Record<string, unknown>;
    };

    const { us, election } = $props() as {
        us: any;
        election: ElectionDatum[];
    };

    const nation = $derived(
        topojson.feature(us, us.objects.nation)
    );
    const stateMesh = $derived(
        topojson.mesh(us, us.objects.states)
    );

    const electionByFips = $derived(
        new Map(
            election.map((d: ElectionDatum) => [d.fips, d])
        )
    );

    const counties = $derived(
        (
            topojson.feature(us, us.objects.counties) as any
        ).features.map((feat: CountyFeature) => {
            return {
                ...feat,
                properties: {
                    ...feat.properties,
                    ...(electionByFips.get(
                        Number(feat.id)
                    ) ?? {})
                }
            };
        })
    );

    const centroids = $derived(
        geoCentroid({ data: counties }) as any
    );
</script>

<Plot
    projection="albers-usa"
    length={{ type: 'sqrt', range: [3, 40] }}>
    <Geo
        data={[nation]}
        fill="var(--svelteplot-bg)"
        stroke="currentColor" />
    <Geo
        data={[stateMesh]}
        stroke="currentColor"
        strokeWidth={0.5} />
    <Vector
        {...centroids}
        length={(d: any) =>
            Math.abs(
                (d.properties?.margin2020 ?? 0) *
                    (d.properties?.votes ?? 0)
            )}
        shape="arrow-filled"
        strokeLinecap="round"
        fill={(d: any) =>
            d.properties?.margin2020 > 0
                ? 'var(--svp-red)'
                : 'var(--svp-blue)'}
        rotate={(d: any) =>
            d.properties?.margin2020 > 0 ? 60 : -60} />
</Plot>
