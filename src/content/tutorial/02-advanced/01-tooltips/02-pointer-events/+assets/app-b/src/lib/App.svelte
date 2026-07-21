<script>
  import { Plot, BarY, RuleY } from 'svelteplot';

  const data = [
    { fruit: 'Apples', sales: 120 },
    { fruit: 'Bananas', sales: 85 },
    { fruit: 'Cherries', sales: 60 },
    { fruit: 'Dates', sales: 45 },
    { fruit: 'Elderberries', sales: 30 },
  ];

  let tooltip = $state(null);
</script>

<Plot>
  <BarY
    {data}
    x="fruit"
    y="sales"
    onpointerenter={(e, d) => (tooltip = d)}
    onpointerleave={() => (tooltip = null)}
  />
  <RuleY y={0} />
</Plot>

{#if tooltip}
  <p>{tooltip.fruit}: {tooltip.sales} units</p>
{/if}
