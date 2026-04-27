<script>
  import data from './polls.csv';
  import {
    Plot,
    Dot,
    Line,
    windowY
  } from 'svelteplot';

  const scheme = {
    CDUCSU: 'black',
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
    fill="party"
    r={2}
    opacity={0.5} />
  <Line
    {...windowY(
      {
        data,
        x: 'date',
        y: 'value',
        stroke: 'party'
      },
      { k: 14, anchor: 'end', strict: true }
    )}
    outlineStroke="var(--bg-1)"
    strokeWidth={2} />
</Plot>
