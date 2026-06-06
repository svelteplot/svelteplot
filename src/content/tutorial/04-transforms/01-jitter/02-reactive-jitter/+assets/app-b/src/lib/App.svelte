<script>
  import { Plot, Dot, jitterX } from 'svelteplot';
  import data from './cars.csv';

  let width = $state(0.45);

  const jittered = $derived(
    jitterX(
      { data, x: 'cylinders', y: 'power (hp)' },
      { type: 'uniform', width }
    )
  );
</script>

<label>
  Spread: <input
    type="range"
    bind:value={width}
    min={0}
    max={0.5}
    step={0.05} />
</label>

<Plot
  x={{ label: 'Cylinders' }}
  y={{ label: 'Power (hp)' }}>
  <Dot {...jittered} opacity={0.5} />
</Plot>
