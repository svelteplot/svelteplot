<script>
  import { Plot, Dot, Hull, RuleX } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot color={{ legend: true }}>
  <Hull
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    fill="species"
    opacity={0.2} />
  <Dot
    {data}
    x="body_mass_g"
    y="bill_length_mm"
    fill="species" />
  <RuleX x={4500} />
</Plot>
