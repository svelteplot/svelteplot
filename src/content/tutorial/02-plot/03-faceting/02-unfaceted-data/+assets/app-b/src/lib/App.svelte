<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot frame>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="gray"
    opacity={0.3}
    r={2} />
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species"
    fy="species" />
</Plot>
