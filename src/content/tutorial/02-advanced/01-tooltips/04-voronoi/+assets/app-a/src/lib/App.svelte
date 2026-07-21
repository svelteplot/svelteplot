<script>
  import { Plot, Dot } from 'svelteplot';
  import penguins from './penguins.csv';
  import { isEqual } from 'es-toolkit/predicate';

  let tooltip = $state(null);
</script>

<Plot frame>
  <Dot
    data={penguins}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    onpointerenter={(e, d) => (tooltip = d)}
    onpointerleave={() => (tooltip = null)}
    stroke={(d) =>
      isEqual(tooltip, d)
        ? 'currentColor'
        : 'transparent'} />
</Plot>

{#if tooltip}
  <p>
    {tooltip.species}: {tooltip.bill_length_mm} mm × {tooltip.bill_depth_mm}
    mm
  </p>
{/if}
