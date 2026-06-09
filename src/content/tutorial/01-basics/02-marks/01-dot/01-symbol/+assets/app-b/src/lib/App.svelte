<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot color={{ legend: true }}>
  <Dot
    {data}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    symbol="species" />
</Plot>
