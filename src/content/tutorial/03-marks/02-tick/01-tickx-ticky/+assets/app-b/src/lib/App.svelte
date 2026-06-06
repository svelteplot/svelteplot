<script>
  import { Plot, TickX } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot y={{ grid: true }}>
  <TickX
    {data}
    x="body_mass_g"
    stroke="species"
    fy="species"
    opacity={0.6} />
</Plot>
