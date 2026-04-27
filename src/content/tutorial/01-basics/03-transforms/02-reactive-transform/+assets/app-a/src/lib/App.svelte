<script>
  import data from './polls.csv';
  import {
    Plot,
    Dot,
    jitterY
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
    {...jitterY(
      {
        data,
        x: 'date',
        y: 'value',
        fill: 'party'
      },
      { type: 'normal', std: 0.001 }
    )} />
</Plot>
