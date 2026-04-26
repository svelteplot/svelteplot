<script>
  import data from './polls.csv';
  import { Plot, Dot, RegressionY } from 'svelteplot';

  const scheme = {
    CDUCSU: 'black',
    AfD: 'deepskyblue'
  };
</script>

<Plot color={{ legend: true, scheme }} y={{ percent: true, grid: true }}>
  <Dot {data} x="date" y="value" stroke="party" r={2} opacity={0.5} />
  <RegressionY {data} x="date" y="value" stroke="party" />
</Plot>
