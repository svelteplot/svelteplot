<script>
  import {
    Plot,
    Dot
  } from 'svelteplot';
  import data from './penguins.csv';

  const scheme = {
    Gentoo: '#4c78a8'
  };
  let island = $state('all');
</script>

<label>
  Island:
  <select bind:value={island}>
    <option value="all"
      >All islands</option>
    <option>Biscoe</option>
    <option>Dream</option>
    <option>Torgersen</option>
  </select>
</label>

<Plot
  color={{ legend: true, scheme }}
  y={{
    grid: true,
    label: 'Body mass (g)'
  }}
  x={{ label: 'Bill length (mm)' }}>
  <Dot
    data={island === 'all'
      ? data
      : data.filter(
          (d) => d.island === island
        )}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
</Plot>
