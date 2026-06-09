<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <Dot
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    fill="species" />
</Plot>
