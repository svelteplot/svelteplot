<script>
  import { Plot, Dot, Voronoi } from 'svelteplot';
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
    stroke={(d) =>
      isEqual(tooltip, d)
        ? 'currentColor'
        : 'transparent'} />
  <Voronoi
    data={penguins}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="transparent"
    stroke="currentColor"
    opacity={0.1}
    onpointerenter={(e, d) => (tooltip = d)}
    onpointerleave={() => (tooltip = null)} />
</Plot>

{#if tooltip}
  <p>
    {tooltip.species}: {tooltip.bill_length_mm} mm × {tooltip.bill_depth_mm}
    mm
  </p>
{/if}
