<script>
  import {
    Plot,
    Dot,
    RuleY
  } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g" />
  <RuleY y={4000} />
</Plot>
