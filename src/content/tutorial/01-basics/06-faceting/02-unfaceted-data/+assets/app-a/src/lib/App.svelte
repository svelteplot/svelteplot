<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot frame>
  <Dot
    {data}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    fy="species" />
</Plot>
