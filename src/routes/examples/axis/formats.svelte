<script module>
    export const title = 'Axis formats';
    export const description =
        'Tick and label formatting examples across linear, logarithmic, and time domains.';
</script>

<script>
    import { Plot, setPlotDefaults } from 'svelteplot';

    setPlotDefaults({
        height: 80
    });
</script>

<figure>
    <figcaption>Linear domain</figcaption>
    <Plot grid x={{ domain: [0, 100] }} />
</figure>

<figure>
    <figcaption>Linear interval</figcaption>
    <Plot
        grid
        x={{
            domain: [0, 100],
            interval: 25
        }} />
</figure>

<figure>
    <figcaption>Linear auto-format</figcaption>
    <Plot grid x={{ domain: [0, 1e6] }} />
</figure>

<figure>
    <figcaption>Log auto-format</figcaption>
    <Plot
        grid
        x={{
            type: 'log',
            domain: [200000, 3000000]
        }} />
</figure>

<figure>
    <figcaption>Time auto-format</figcaption>
    <Plot
        grid
        x={{
            // nice: true,
            domain: [
                new Date(2000, 0, 1),
                new Date(2002, 0, 1)
            ]
        }} />
</figure>

<figure>
    <figcaption>Months</figcaption>
    <Plot
        grid
        x={{
            domain: [
                new Date(2000, 0, 1),
                new Date(2000, 11, 1)
            ]
        }} />
</figure>

<figure>
    <figcaption>Quarterly ticks</figcaption>
    <Plot
        grid
        x={{
            interval: 'quarter',
            domain: [
                new Date(2000, 0, 1),
                new Date(2000, 11, 1)
            ]
        }} />
</figure>

<figure>
    <figcaption>Weeks</figcaption>
    <Plot
        grid
        x={{
            domain: [
                new Date(2000, 0, 1),
                new Date(2000, 2, 1)
            ]
        }} />
</figure>

<figure>
    <figcaption>Daily</figcaption>
    <Plot
        grid
        x={{
            domain: [
                new Date(2000, 0, 1),
                new Date(2000, 0, 10)
            ]
        }} />
</figure>

<figure>
    <figcaption>Time nice</figcaption>
    <Plot
        grid
        x={{
            nice: true,
            domain: [
                new Date(2000, 0, 9),
                new Date(2002, 11, 27)
            ]
        }} />
</figure>

<style>
    figure {
        margin: 0;
    }

    figcaption {
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
    }
</style>
