<script>
  import data from './polls.csv';
  import { Plot, Dot } from 'svelteplot';

  const scheme = {
    CDUCSU: 'black',
    AfD: 'deepskyblue'
  };
</script>

<Plot
  color={{ legend: true, scheme }}
  y={{ percent: true, grid: true }}
  x={{ interval: 'month' }}>
  <Dot {data} x="date" y="value" fill="party" />
</Plot>
