<script>
  import data from './aapl.csv';
  import {
    Plot,
    Line
  } from 'svelteplot';

  const unsorted = [...data].sort(
    (a, b) => a.Close - b.Close
  );
</script>

<Plot y={{ grid: true }}>
  <Line
    data={unsorted}
    x="Date"
    y="Close"
    sort="Date" />
</Plot>
