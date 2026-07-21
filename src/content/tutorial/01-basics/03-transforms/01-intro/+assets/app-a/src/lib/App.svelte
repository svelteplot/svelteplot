<script>
  import { Plot, Dot } from 'svelteplot';
  import penguins from './penguins.csv';
</script>

<Plot>
  <Dot data={penguins} x="species" y="body_mass_g" fill="species" />
</Plot>
