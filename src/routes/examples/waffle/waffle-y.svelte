<script module>
    export let title = 'Vertical waffle';
    export let sortKey = 1;
    export let repl =
        'https://svelte.dev/playground/7312ce68199747b8b49814bb4adcefee?version=5';
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
