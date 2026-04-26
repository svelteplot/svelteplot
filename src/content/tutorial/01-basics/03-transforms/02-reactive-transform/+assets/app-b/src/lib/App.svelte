<script>
  import data from './polls.csv';
  import { Plot, Dot, jitterY } from 'svelteplot';

  const scheme = {
    CDUCSU: 'black',
    AfD: 'deepskyblue'
  };

  let std = $state(0.001);
</script>

<Plot color={{ legend: true, scheme }} y={{ percent: true, grid: true }}>
  <Dot {...jitterY({ data, x: 'date', y: 'value', fill: 'party' }, { type: 'normal', std })} />
</Plot>

<input type="range" bind:value={std} min={0} max={1 / 100} step={1 / 10000} />
{std}
