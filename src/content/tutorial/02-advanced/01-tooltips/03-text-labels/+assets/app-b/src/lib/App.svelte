<script>
  import { Plot, BarY, RuleY, Text } from 'svelteplot';

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
    fillOpacity={tooltip ? (d) => (d === tooltip ? 1 : 0.3) : 1}
    onpointerenter={(e, d) => (tooltip = d)}
    onpointerleave={() => (tooltip = null)}
  />
  <RuleY y={0} />
  <Text
    data={tooltip ? [tooltip] : []}
    x="fruit"
    y="sales"
    text={(d) => String(d.sales)}
    lineAnchor="bottom"
    dy={-4}
  />
</Plot>
