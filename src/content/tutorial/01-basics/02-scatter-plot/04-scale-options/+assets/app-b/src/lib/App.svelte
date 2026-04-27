<script>
  import data from './polls.csv';
  import {
    Plot,
    Dot
  } from 'svelteplot';

  const scheme = {
    CDUCSU: 'light-dark(black, white)',
    AfD: 'deepskyblue'
  };
</script>

<Plot
  color={{ legend: true, scheme }}
  y={{ percent: true, grid: true }}
  x={{ interval: 'month' }}>
  <Dot
    {data}
    x="date"
    y="value"
    fill="party" />
</Plot>
