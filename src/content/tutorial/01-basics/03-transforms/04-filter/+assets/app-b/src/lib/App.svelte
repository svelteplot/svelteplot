<script>
  import { Plot, BarY, RuleY, groupX } from 'svelteplot';
  import penguins from './penguins.csv';
</script>

<Plot>
  <BarY
    {...groupX(
      { data: penguins, x: 'species', fill: 'species', filter: (d) => d.island !== 'Torgersen' },
      { y: 'count' }
    )}
    sort={{ channel: '-y' }}
  />
  <RuleY y={0} />
</Plot>
