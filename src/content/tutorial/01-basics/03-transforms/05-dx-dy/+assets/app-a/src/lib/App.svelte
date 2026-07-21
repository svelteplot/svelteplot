<script>
  import { Plot, BarY, RuleY, groupX } from 'svelteplot';
  import penguins from './penguins.csv';

  const grouped = $derived(
    groupX({ data: penguins, x: 'species', fill: 'species' }, { y: 'count' })
  );
</script>

<Plot>
  <BarY {...grouped} />
  <RuleY y={0} />
</Plot>
