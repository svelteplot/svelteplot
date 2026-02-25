<script module>
    export const title = 'Faceted bars';
    export const fullCode = true;
</script>

<script lang="ts">
    import { Plot, BarY } from 'svelteplot';
    import { SvelteSet } from 'svelte/reactivity';
    import { Checkbox } from '$shared/ui';

    const resultsLong = [
        { party: 'Union', year: 2025, percent: 30 },
        { party: 'Union', year: 2021, percent: 22 },
        { party: 'SPD', year: 2025, percent: 20 },
        { party: 'SPD', year: 2021, percent: 27 },
        { party: 'Grüne', year: 2025, percent: 16 },
        { party: 'Grüne', year: 2021, percent: 21 },
        { party: 'FDP', year: 2025, percent: 6 },
        { party: 'FDP', year: 2021, percent: 12 },
        { party: 'Linke', year: 2025, percent: 4 },
        { party: 'Linke', year: 2021, percent: 7 }
    ];
    const parties = new Set(
        resultsLong.map((r) => r.party)
    );

    let filters = new SvelteSet(parties);

    const resultsLongFiltered = $derived(
        resultsLong.filter((d) => filters.has(d.party))
    );
</script>

{#each parties as party (party)}
    <Checkbox
        value={filters.has(party)}
        label={party}
        onchange={() =>
            filters[filters.has(party) ? 'delete' : 'add'](
                party
            )} />
{/each}

<Plot
    x={{ label: ' ' }}
    y={{ label: '' }}
    fx={{
        axis: 'bottom',
        axisProps: {
            tickFontSize: 12
        },
        axisOptions: {
            dy: 20,
            fontWeight: 'bold'
        }
    }}
    opacity={{ range: [0.4, 1] }}>
    <BarY
        data={resultsLongFiltered}
        x="year"
        y="percent"
        dx={(d) => (d.year === 2021 ? 10 : -10)}
        fx="party"
        fill="party"
        opacity="year" />
</Plot>
