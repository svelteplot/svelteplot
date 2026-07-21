<script>
  import { Plot, Line } from 'svelteplot';
  import data from './aapl.csv';
</script>

<Plot y={{ zero: true }}>
  <Line {data} x="Date" y="Close" />
</Plot>
