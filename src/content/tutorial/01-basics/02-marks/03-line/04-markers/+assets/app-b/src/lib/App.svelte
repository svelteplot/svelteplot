<script>
  import data from './polls.csv';
  import { Plot, Line } from 'svelteplot';
</script>

<Plot y={{ percent: true, grid: true }}>
  <Line
    {data}
    x="date"
    y="value"
    stroke="party"
    markerEnd="dot"
    markerScale={2} />
</Plot>
