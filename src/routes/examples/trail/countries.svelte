<script module>
    export const title = 'Country trails';
    export const description =
        'Based on the <a href="https://truth-and-beauty.net/projects/remixing-rosling">Remixing Rosling project by Moritz Stefaner</a>, this example shows the development of fertility rate and life expectancy for different countries over time.';
    export const data = {
        gapminder: '/data/gapminder.csv'
    };
    export const sortKey = 50;
</script>

<script lang="ts">
    import { sineInOut } from 'svelte/easing';
    import { Tween } from 'svelte/motion';
    import { Plot, Trail, Text, Dot } from 'svelteplot';
    import { useDark } from '$shared/ui';

    let { gapminder } = $props();

    const countries = {
        ind: 'India',
        fra: 'France',
        ken: 'Kenia',
        chn: 'China',
        bra: 'Brazil',
        usa: 'USA',
        // idn: 'Indonesia',
        // vnm: 'Vietnam',
        irq: 'Iraq'
    };

    const MIN_YEAR = 1960;
    const MAX_YEAR = 2023;

    const ds = useDark();

    let maxYear = new Tween(2023, {
        duration: 10000,
        easing: sineInOut
    });

    const minYear = $derived(
        Math.max(MIN_YEAR, Math.floor(maxYear.current - 20))
    );

    async function play() {
        await maxYear.set(MIN_YEAR + 2, { duration: 500 });
        maxYear.set(MAX_YEAR);
    }

    const selectedCountries = $derived(
        gapminder
            .filter(
                (d) =>
                    d.Year >= minYear &&
                    d.Year <= Math.ceil(maxYear.current) &&
                    countries[d.Code]
            )
            .map((d) => ({
                ...d,
                Country: countries[d.Code]
            }))
            .sort((a, b) => a.Year - b.Year)
            .sort((a, b) => a.Code.localeCompare(b.Code))
    );
</script>

<button onclick={play}>play animation</button>
<Plot
    height={500}
    grid
    x={{ type: 'linear', insetLeft: 40, insetRight: 4 }}
    y={{ insetTop: 20, insetBottom: 4, tickSpacing: 60 }}
    r={{
        domain: [minYear - 1, maxYear.current],
        zero: false
    }}>
    <!-- country trails -->
    <Trail
        data={selectedCountries}
        x="Fertility rate"
        y="Life expectancy"
        r="Year"
        fill="Country"
        z="Country"
        opacity={0.7}
        curve="catmull-rom"
        tension={1}
        blend={ds.isDark ? 'screen' : 'multiply'} />
    <!-- dots on last year and every five -->
    <Dot
        data={selectedCountries}
        filter={(d) =>
            d.Year === Math.ceil(maxYear.current) ||
            d.Year % 5 === 0}
        x="Fertility rate"
        y="Life expectancy"
        r="Year"
        fill="Country"
        opacity={1} />
    <!-- country labels -->
    <Text
        data={selectedCountries}
        filter={(d) =>
            d.Year === Math.ceil(maxYear.current)}
        x="Fertility rate"
        y="Life expectancy"
        text="Country"
        fill="Country"
        rotate={15}
        dx={-12}
        dy={-3}
        fontSize={14}
        fontWeight="bold"
        stroke="var(--svelteplot-bg)"
        textAnchor="end"
        lineAnchor="bottom" />
    <!-- year range -->
    <Text
        frameAnchor="top-right"
        fontSize="2rem"
        fontWeight="bold"
        fontVariant="tabular-nums"
        opacity={0.5}
        dx={-10}
        dy={10}
        text="{minYear} - {maxYear.current.toFixed(0)}" />
</Plot>
