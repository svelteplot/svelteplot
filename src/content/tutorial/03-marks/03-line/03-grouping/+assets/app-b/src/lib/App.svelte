<script>
  import data from './bls.csv';
  import { Plot, Line } from 'svelteplot';
</script>

<Plot grid>
  <Line
    {data}
    x="date"
    y="unemployment"
    stroke="division" />
</Plot>
