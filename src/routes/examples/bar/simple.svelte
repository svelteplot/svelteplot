<script module>
    export let title = 'Simple Bars';
    export let sortKey = 1;
</script>

<script>
    import { Plot, BarY, RuleY } from 'svelteplot';

    const data = [
        { fruit: 'Apples', quantity: 212 },
        { fruit: 'Bananas', quantity: 207 },
        { fruit: 'Cherries', quantity: 315 },
        { fruit: 'Dates', quantity: 11 }
    ];
</script>

<Plot grid>
    <RuleY data={[0]} />
    <BarY {data} x="fruit" y="quantity" />
</Plot>
