<script>
  import {
    Plot,
    Dot,
    GridY
  } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <GridY
    stroke="red"
    strokeDasharray="3,3"
    strokeOpacity={1} />
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
</Plot>
