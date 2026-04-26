<script>
  import { csvParse, autoType } from 'd3-dsv';

  let data = $state([]);

  $effect(async () => {
    const res = await fetch('/data/aapl.csv');
    const text = await res.text();
    data = csvParse(text, autoType);
  });
</script>

<h1>Welcome to SveltePlot!</h1>
<pre>{data}</pre>
