<script module>
    export const title = 'Major and minor ticks';
    export const description =
        'You can add minor ticks lines by adding a second axis and disabling the text labels.';
</script>

<script>
    import { Plot, AxisX, AxisY, Line } from 'svelteplot';
    import { page } from '$app/state';
    let { aapl } = $derived(page.data.data);
</script>

<Plot grid inset={10}>
    <AxisX />
    <AxisX interval="1 month" text={false} tickSize={3} />
    <AxisY />
    <AxisY interval={5} text={false} tickSize={3} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
