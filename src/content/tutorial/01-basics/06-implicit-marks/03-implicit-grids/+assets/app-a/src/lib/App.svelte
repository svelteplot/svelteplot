<script>
  import data from './aapl.csv';
  import { Plot, Line } from 'svelteplot';
</script>

<Plot>
  <Line {data} x="Date" y="Close" />
</Plot>
