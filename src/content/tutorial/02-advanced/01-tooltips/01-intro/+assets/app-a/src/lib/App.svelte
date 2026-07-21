<script>
  import { Plot, BarY, RuleY } from 'svelteplot';

  const data = [
    { fruit: 'Apples', sales: 120 },
    { fruit: 'Bananas', sales: 85 },
    { fruit: 'Cherries', sales: 60 },
    { fruit: 'Dates', sales: 45 },
    { fruit: 'Elderberries', sales: 30 },
  ];
</script>

<Plot>
  <BarY {data} x="fruit" y="sales" />
  <RuleY y={0} />
</Plot>
