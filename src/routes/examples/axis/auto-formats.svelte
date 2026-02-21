<script module>
    export const title = 'Auto formats';
    export const description =
        'Automatic tick formatting for numeric, log, and time x scales.';
</script>

<script>
    import { Plot, setPlotDefaults } from 'svelteplot';

    setPlotDefaults({
        height: 80,
        grid: true
    });
</script>

<Plot subtitle="Linear" x={{ domain: [0, 100] }} />

<Plot
    subtitle="Linear (large values)"
    x={{ domain: [0, 1e6] }} />

<Plot
    subtitle="Log"
    x={{
        type: 'log',
        domain: [200000, 3000000]
    }} />

<Plot
    subtitle="Time (years)"
    x={{
        domain: [new Date(2000, 0, 1), new Date(2002, 0, 1)]
    }} />

<Plot
    subtitle="Time (days)"
    x={{
        domain: [
            new Date(2000, 0, 1),
            new Date(2000, 0, 10)
        ]
    }} />
