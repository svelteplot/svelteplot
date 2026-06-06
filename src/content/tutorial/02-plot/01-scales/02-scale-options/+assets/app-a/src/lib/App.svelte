<script>
  import { Plot, Line } from 'svelteplot';
  import data from './aapl.csv';
</script>

<Plot y={{ grid: true }}>
  <Line {data} x="Date" y="Close" />
</Plot>
