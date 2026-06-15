<script>
  import { Plot, Dot, AxisX, AxisY } from 'svelteplot';
  import data from './penguins.csv';
</script>

<Plot axes={false} frame grid>
  <Dot
    {data}
    x="bill_length_mm"
    y="body_mass_g"
    fill="species" />
  <AxisX tickFontSize={14} interval={3} />
  <AxisY fill="fuchsia" stroke="lime" />
</Plot>
