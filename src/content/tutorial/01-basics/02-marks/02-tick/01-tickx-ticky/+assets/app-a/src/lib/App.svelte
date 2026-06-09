<script>
  import { Plot, DotX } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot y={{ grid: true }}>
  <DotX
    {data}
    x="body_mass_g"
    fill="species"
    fy="species"
    opacity={0.6} />
</Plot>
