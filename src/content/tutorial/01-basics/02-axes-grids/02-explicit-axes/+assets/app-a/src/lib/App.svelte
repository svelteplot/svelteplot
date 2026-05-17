<script>
  import {
    Plot,
    Dot
  } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot axes={false}>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
</Plot>
