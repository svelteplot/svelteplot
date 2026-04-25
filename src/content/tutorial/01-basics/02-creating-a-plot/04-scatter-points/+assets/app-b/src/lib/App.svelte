<script>
	import { Plot, Dot } from 'svelteplot';
	import data from './polls.csv';
</script>

<Plot>
	<Dot {data} x="date" y="value" fill="party" />
</Plot>

