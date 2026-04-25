<script>
	import data from './aapl.csv';
	import { Plot, Line } from 'svelteplot';
</script>

<Plot y={{ grid: true }}>
	<Line {data} x="Date" y="Close" />
</Plot>

