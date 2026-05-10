<script>
  import data from './polls.csv';
  import {
    Plot,
    Line
  } from 'svelteplot';
</script>

<Plot y={{ percent: true, grid: true }}>
  <Line
    {data}
    x="date"
    y="value"
    stroke="party"
    text="party"
    textStartOffset="10%"
    textStroke="var(--svelteplot-bg)"
    textStrokeWidth={4} />
</Plot>
