<script module>
    export let title = 'Vertical waffle';
    export let sortKey = 1;
</script>

<script>
    import { Plot, WaffleY, RuleY } from 'svelteplot';

    const data = [
        { fruit: 'Apples', quantity: 212 },
        { fruit: 'Bananas', quantity: 207 },
        { fruit: 'Cherries', quantity: 315 },
        { fruit: 'Dates', quantity: 11 }
    ];
</script>

<Plot grid>
    <RuleY data={[0]} />
    <WaffleY multiple={10} {data} x="fruit" y="quantity" />
</Plot>
