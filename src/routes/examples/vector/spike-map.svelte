<script module>
    export const title = 'Spike map';
    export const transforms = ['geoCentroid'];
    export const repl =
        'https://svelte.dev/playground/186c3954751e4d04b42f9901f4b00305?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        Geo,
        Spike,
        geoCentroid
    } from 'svelteplot';
    import * as topojson from 'topojson-client';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { us, election } = $derived(
        page.data.data
    ) as ExamplesData;

    const nation = $derived(
        topojson.feature(us, us.objects.nation)
    );
    const stateMesh = $derived(
        topojson.mesh(us, us.objects.states)
    );

    const _election = $derived(
        new Map(election.map((d) => [d.fips, d]))
    );

    const counties = $derived(
        topojson
            .feature(us, us.objects.counties)
            .features.map((feat) => {
                return {
                    ...feat,
                    properties: {
                        ...feat.properties,
                        ...(_election.get(+feat?.id) || {})
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
        })}
        stroke="var(--svp-green)"
        length={(d) => d.properties?.votes ?? 0} />
</Plot>
