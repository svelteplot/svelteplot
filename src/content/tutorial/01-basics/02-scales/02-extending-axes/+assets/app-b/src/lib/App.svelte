<script>
  import { Plot, Line, RuleY } from 'svelteplot';
  import data from './aapl.csv';
</script>

<Plot>
  <Line {data} x="Date" y="Close" />
  <RuleY y={0} />
</Plot>
