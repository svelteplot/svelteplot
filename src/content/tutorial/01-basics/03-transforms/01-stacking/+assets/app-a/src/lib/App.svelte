<script>
  import { Plot, BarY, RuleY } from 'svelteplot';
  import data from './fruit-sales.csv';
</script>

<Plot>
  <BarY {data} x="Quarter" y="Sales" />
  <RuleY y={0} />
</Plot>
