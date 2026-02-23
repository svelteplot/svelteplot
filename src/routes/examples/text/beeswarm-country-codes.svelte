<script module>
    export const title = 'Beeswarm country codes';
    export const sortKey = 30;
    export const marks = ['Text'];
    export const transforms = ['dodge'];
    export const data = {
        countries: '/data/countries_2020.csv'
    };
    export const description =
        'Based on <a href="/examples/dot/beeswarm-bubbles">Beeswarm bubbles</a>, but using text labels (country codes) with variable font size.';
</script>

<script lang="ts">
    import { Plot, Text } from 'svelteplot';

    type CountryDatum = {
        Population: number | string;
        Code: string;
        'Life expectancy': number | string;
        Continent: string;
    };

    const { countries }: { countries: CountryDatum[] } =
        $props();

    const populations = $derived(
        countries.map((d: CountryDatum) =>
            Math.max(1, +d.Population || 1)
        )
    );

    const maxPopulation = $derived(
        Math.max(...populations)
    );

    const fontSize = (d: CountryDatum) =>
        2 + Math.sqrt((d.Population as number) / maxPopulation) * 50;
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 8e3}
    inset={20}
    r={{ range: [1, 50] }}
    x={{ type: 'log' }}
    y={{ axis: false }}>
    <Text
        data={countries}
        x="Life expectancy"
        y={0}
        r="Population"
        dodgeY="middle"
        sort={{ channel: '-r' }}
        text="Code2"
        {fontSize}
        fontWeight={700}
        lineAnchor="middle"
        textAnchor="middle"
        fill="Continent" />
</Plot>
