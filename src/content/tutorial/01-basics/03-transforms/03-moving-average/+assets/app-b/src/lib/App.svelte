<script>
  import data from './polls.csv';
  import {
    Plot,
    Dot,
    Line
  } from 'svelteplot';

  const scheme = {
    CDUCSU: 'currentColor',
    AfD: 'deepskyblue'
  };
</script>

<Plot
  color={{ legend: true, scheme }}
  y={{ percent: true, grid: true }}>
  <Dot
    {data}
    x="date"
    y="value"
    fill="party" />
  <Line
    {data}
    x="date"
    y="value"
    stroke="party"
    sort="party" />
</Plot>
