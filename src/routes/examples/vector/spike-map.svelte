<script module>
    export const title = 'Spike map';
    // export const transforms = ['geoCentroid'];
    export const data = {
        us: '/data/us-counties-10m.json',
        election: '/data/election.csv'
    };
</script>

<script lang="ts">
    import {
        Plot,
        Geo,
        Spike,
        geoCentroid
    } from 'svelteplot';
    import * as topojson from 'topojson-client';

    const { us, election } = $props() as {
        us: any;
        election: any[];
    };

    const nation = $derived(
        (topojson as any).feature(us, us.objects.nation)
    );
    const stateMesh = $derived(
        topojson.mesh(us, us.objects.states)
    );

    const _election = $derived(
        new Map(election.map((d: any) => [d.fips, d]))
    );

    const counties = $derived(
        (topojson as any)
            .feature(us, us.objects.counties)
            .features.map((feat: any) => {
                return {
                    ...feat,
                    properties: {
                        ...(feat as any).properties,
                        // oxlint-disable-next-line unicorn/no-useless-fallback-in-spread -- TS requires ?? {} for Map.get()
                        ...(_election.get(+feat?.id) ?? {})
                    }
                };
            })
    );
</script>

<Plot projection="albers-usa" length={{ range: [0, 100] }}>
    <Geo
        data={[nation]}
        fill="var(--svelteplot-bg)"
        stroke="currentColor" />
    <Geo
        data={[stateMesh]}
        stroke="currentColor"
        strokeWidth={0.5} />
    <Spike
        {...geoCentroid({
            data: counties
        }) as any}
        stroke="var(--svp-green)"
        length={(d) => (d as any).properties?.votes ?? 0} />
</Plot>
