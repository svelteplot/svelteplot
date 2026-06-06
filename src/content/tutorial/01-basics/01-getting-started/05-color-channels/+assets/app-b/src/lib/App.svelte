<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot color={{ scheme: 'plasma' }}>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="body_mass_g" />
</Plot>
