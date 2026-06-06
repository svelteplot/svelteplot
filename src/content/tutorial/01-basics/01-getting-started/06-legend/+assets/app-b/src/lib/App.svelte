<script>
  import { Plot, Dot } from 'svelteplot';
  import data from './penguins.csv';

  const scheme = {
    Gentoo: '#4c78a8'
  };
</script>

<Plot color={{ legend: true, scheme }}>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
</Plot>
