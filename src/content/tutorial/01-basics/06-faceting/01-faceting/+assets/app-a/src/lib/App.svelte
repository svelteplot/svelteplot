<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="island" />
</Plot>
