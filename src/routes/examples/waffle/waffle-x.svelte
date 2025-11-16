<script module>
    export let title = 'Horizontal waffle';
    export let sortKey = 2;
    export let repl =
        'https://svelte.dev/playground/56ab7b1534714fd3b8b8416048365701?version=5';
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
