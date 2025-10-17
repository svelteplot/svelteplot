<script module>
    export const title = 'Beeswarm bubbles';
    export const sortKey = 31;
    export const marks = ['Dot'];
    export const transforms = ['dodge'];
</script>

<script lang="ts">
    import { Plot, Dot } from '$lib';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { countries_2020: countries } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 8e3}
    inset={20}
    r={{ range: [1, 50] }}
    x={{ type: 'log' }}
    y={{ axis: false }}>
    <Dot
        data={countries}
        x="Life expectancy"
        sort={{ channel: '-r' }}
        y={0}
        r="Population"
        dodgeY="middle"
        fill="Continent" />
</Plot>
