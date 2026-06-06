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
    curve="monotone-x" />
</Plot>
