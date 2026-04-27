<script>
  import data from './aapl.csv';
  import {
    Plot,
    Line,
    AreaY
  } from 'svelteplot';
</script>

<h1>Welcome to SveltePlot!</h1>

<Plot>
  <Line {data} x="Date" y="Close" />
  <AreaY
    {data}
    x="Date"
    y="Close"
    opacity={0.2} />
</Plot>
