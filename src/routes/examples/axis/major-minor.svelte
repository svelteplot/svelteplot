<script module>
    export const title = 'Major and minor ticks';
    export const description =
        'You can add minor ticks lines by adding a second axis and disabling the text labels.';
    export const data = { aapl: '/data/aapl.csv' };
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    let { aapl } = $props();
</script>

<Plot grid inset={10}>
    <AxisX />
    <AxisX interval="1 month" text={false} tickSize={3} />
    <AxisY />
    <AxisY interval={5} text={false} tickSize={3} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
