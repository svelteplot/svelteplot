<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot frame inset={5}>
  <Dot
    {data}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="gray"
    opacity={0.3}
    r={2} />
  <Dot
    {data}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    fy="species" />
</Plot>
