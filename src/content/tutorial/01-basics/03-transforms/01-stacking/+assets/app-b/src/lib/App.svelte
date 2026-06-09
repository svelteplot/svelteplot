<script>
  import { Plot, BarY, RuleY } from 'svelteplot';
  import data from './fruit-sales.csv';
</script>

<Plot>
  <BarY {data} x="Quarter" y1={0} y2="Sales" />
  <RuleY y={0} />
</Plot>
