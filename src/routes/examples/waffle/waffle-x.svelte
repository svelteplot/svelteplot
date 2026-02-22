<script module>
    export let title = 'Horizontal waffle';
    export let sortKey = 2;
</script>

<script>
    import { Plot, WaffleX, RuleX } from 'svelteplot';

    const data = [
        { fruit: 'Apples', quantity: 212 },
        { fruit: 'Bananas', quantity: 207 },
        { fruit: 'Cherries', quantity: 315 },
        { fruit: 'Dates', quantity: 11 }
    ];
</script>

<Plot grid height={400}>
    <RuleX data={[0]} />
    <WaffleX {data} y="fruit" x="quantity" />
</Plot>
