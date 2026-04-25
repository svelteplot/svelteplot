<script>
	import data from './aapl.csv';
	import { Plot, Line, AxisX, AxisY } from 'svelteplot';
</script>

<Plot>
	<Line data={data} x="Date" y="Close" />
	<AxisX />
	<AxisY fill="red" stroke="teal" />
</Plot>

