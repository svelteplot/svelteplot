<script>
  import {
    Plot,
    Dot
  } from 'svelteplot';
  import data from './cars.csv';
</script>

<Plot
  x={{ label: 'Cylinders' }}
  y={{ label: 'Power (hp)' }}>
  <Dot
    {data}
    x="cylinders"
    y="power (hp)"
    opacity={0.5} />
</Plot>
