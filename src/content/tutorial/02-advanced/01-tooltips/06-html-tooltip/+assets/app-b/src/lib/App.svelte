<script>
  import { Plot, Dot, HTMLTooltip } from 'svelteplot';
  import penguins from './penguins.csv';
</script>

<Plot frame>
  <Dot
    data={penguins}
    x="bill_length_mm"
    y="bill_depth_mm"
    fill="species" />
  {#snippet overlay()}
    <HTMLTooltip
      data={penguins}
      x="bill_length_mm"
      y="bill_depth_mm">
      {#snippet children({ datum })}
        <div class="tooltip">
          <strong>{datum?.species}</strong><br />
          bill: {datum?.bill_length_mm} × {datum?.bill_depth_mm}
          mm
        </div>
      {/snippet}
    </HTMLTooltip>
  {/snippet}
</Plot>

<style>
  .tooltip {
    background: white;
    background: var(--svelteplot-tooltip-bg);
    border: 1px solid #ccc;
    border-color: var(--svelteplot-tooltip-border);
    font-size: 12px;
    padding: 1ex 1em;
    border-radius: 3px;
    line-height: 1.2;
    box-shadow:
      rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
      rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
  }
</style>
