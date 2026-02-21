<script module>
    export const title = 'Nice domain';
    export const description =
        'How nice: true extends numeric and time x-domain bounds.';
</script>

<script>
    import { Plot, setPlotDefaults } from 'svelteplot';

    setPlotDefaults({
        height: 80,
        grid: true
    });
</script>

<Plot
    subtitle="Linear (integers)"
    x={{
        nice: true,
        domain: [3, 93]
    }} />

<Plot
    subtitle="Linear (decimals)"
    x={{
        nice: true,
        domain: [0.13, 0.97]
    }} />

<Plot
    subtitle="Log"
    x={{
        type: 'log',
        nice: true,
        domain: [230000, 2900000]
    }} />

<Plot
    subtitle="Time (years)"
    x={{
        nice: true,
        domain: [
            new Date(2000, 0, 9),
            new Date(2002, 11, 27)
        ]
    }} />

<Plot
    subtitle="Time (months)"
    x={{
        nice: true,
        domain: [
            new Date(2000, 0, 9),
            new Date(2000, 2, 17)
        ]
    }} />
