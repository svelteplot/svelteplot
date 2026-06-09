<script>
  import { Plot, Line, RuleX } from 'svelteplot';
  import data from './aapl.csv';
</script>

<Plot>
  <Line {data} x="Date" y="Close" />
  <RuleX x={new Date('2016-01-01')} stroke="red" />
</Plot>
