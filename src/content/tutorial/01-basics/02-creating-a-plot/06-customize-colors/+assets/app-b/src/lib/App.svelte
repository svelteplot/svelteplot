<script>
  import data from './polls.csv';
  import { Plot, Dot } from 'svelteplot';

  const scheme = {
    CDUCSU: 'black',
    AfD: 'deepskyblue'
  };
</script>

<Plot color={{ legend: true, scheme }}>
  <Dot {data} x="date" y="value" fill="party" />
</Plot>
