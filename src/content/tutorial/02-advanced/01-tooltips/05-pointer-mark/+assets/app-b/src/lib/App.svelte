<script>
  import { Plot, Dot, Frame, Pointer } from 'svelteplot';
  import penguins from './penguins.csv';
  import { isEqual } from 'es-toolkit/predicate';

  let tooltip = $state(null);
</script>

<Plot>
  <Dot
    data={penguins}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species"
    stroke={(d) =>
      isEqual(tooltip, d)
        ? 'currentColor'
        : 'transparent'} />
  <Pointer
    data={penguins}
    x="bill_length_mm"
    y="bill_depth_mm"
    onupdate={(selection) =>
      (tooltip = selection[0] ?? null)} />
  <Frame />
</Plot>

{#if tooltip}
  <p>
    {tooltip.species}: {tooltip.bill_length_mm} mm × {tooltip.bill_depth_mm}
    mm
  </p>
{/if}
