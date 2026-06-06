<script>
  import { Plot, Dot, jitterX } from 'svelteplot';
  import data from './cars.csv';

  const jittered = $derived(
    jitterX(
      { data, x: 'cylinders', y: 'power (hp)' },
      { type: 'uniform', width: 0.45 }
    )
  );
</script>

<Plot
  x={{ label: 'Cylinders' }}
  y={{ label: 'Power (hp)' }}>
  <Dot {...jittered} opacity={0.5} />
</Plot>
