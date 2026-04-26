<script>
  import data from './aapl.csv';
  import { Plot, Line } from 'svelteplot';
</script>

<Plot axes={false}>
  <Line {data} x="Date" y="Close" />
</Plot>
