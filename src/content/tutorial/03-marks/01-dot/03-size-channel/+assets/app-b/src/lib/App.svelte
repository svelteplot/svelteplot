<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot
  color={{ legend: true }}
  inset={10}
  r={{ zero: false }}>
  <Dot
    {data}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    r="body_mass_g" />
</Plot>
