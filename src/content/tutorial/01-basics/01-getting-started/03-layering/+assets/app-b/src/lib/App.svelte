<script>
  import { Plot, Dot, RuleX, RuleY } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot>
  <Dot {data} x="bill_length_mm" y="body_mass_g" />
  <RuleY y={4000} />
  <RuleX x={45} />
</Plot>
