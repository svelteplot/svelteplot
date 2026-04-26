<script>
  import data from './aapl.csv';
  import { Plot, Line } from 'svelteplot';
</script>

<h1>Welcome to SveltePlot!</h1>

<Plot>
  <Line {data} x="Date" y="Close" />
</Plot>
