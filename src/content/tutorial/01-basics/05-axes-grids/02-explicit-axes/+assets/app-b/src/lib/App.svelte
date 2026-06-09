<script>
  import { Plot, Dot, AxisX, AxisY } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
  <AxisX label="Bill length (mm)" />
  <AxisY label="Body mass (g)" />
</Plot>
