<script>
  import data from './polls.csv';
  import { Plot, Dot } from 'svelteplot';
</script>

<Plot>
  <Dot {data} x="date" y="value" fill="party" />
</Plot>
