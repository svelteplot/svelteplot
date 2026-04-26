<script>
  let data = $state();

  $effect(async () => {
    const res = await fetch('/data/aapl.csv');
    data = await res.text();
  });
</script>

<h1>Fetching a file</h1>

<pre>{data}</pre>
