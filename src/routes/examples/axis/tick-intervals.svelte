<script module>
    export const title = 'Tick intervals';
    export const description =
        'Explicit numeric and time intervals for x-axis ticks.';
</script>

<script>
    import { Plot, setPlotDefaults } from 'svelteplot';

    setPlotDefaults({
        height: 80,
        grid: true
    });
</script>

<Plot
    subtitle="Numeric interval (25)"
    x={{
        domain: [0, 100],
        interval: 25
    }} />

<Plot
    subtitle="Numeric interval (0.25)"
    x={{
        domain: [0, 2],
        interval: 0.25
    }} />

<Plot
    subtitle="Time interval (quarter)"
    x={{
        interval: 'quarter',
        domain: [
            new Date(2000, 0, 1),
            new Date(2000, 11, 1)
        ]
    }} />

<Plot
    subtitle="Time interval (week)"
    x={{
        interval: 'week',
        domain: [new Date(2000, 0, 1), new Date(2000, 2, 1)]
    }} />

<Plot
    subtitle="Time interval (day)"
    x={{
        interval: 'day',
        domain: [
            new Date(2000, 0, 1),
            new Date(2000, 0, 10)
        ]
    }} />
