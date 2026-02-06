<script module>
	export const title = 'Canvas rendering test';
	export const description = 'Testing canvas rendering for Rule marks';
	export const data = { aapl: '/data/aapl.csv' };
</script>

<script lang="ts">
	import { Plot, RuleY, RuleX, Dot } from 'svelteplot';
	import type { AaplRow } from '../types';
	let { aapl }: { aapl: AaplRow[] } = $props();

	const firstHundred = aapl.slice(0, 100);
</script>

<h3>RuleY with canvas rendering</h3>
<Plot inset={10}>
	<RuleY data={firstHundred} y="Close" stroke="steelblue" strokeWidth={2} canvas />
	<Dot data={firstHundred} x="Date" y="Close" r={2} fill="red" />
</Plot>

<h3>RuleX with canvas rendering</h3>
<Plot inset={10}>
	<RuleX data={firstHundred.slice(0, 20)} x="Date" stroke="purple" strokeWidth={2} canvas />
	<Dot data={firstHundred} x="Date" y="Close" r={2} fill="orange" />
</Plot>

<h3>Mixed: RuleY SVG vs Canvas</h3>
<div style="display: flex; gap: 1rem;">
	<div>
		<h4>SVG (default)</h4>
		<Plot inset={10}>
			<RuleY data={firstHundred} y="Close" stroke="steelblue" strokeWidth={2} />
		</Plot>
	</div>
	<div>
		<h4>Canvas</h4>
		<Plot inset={10}>
			<RuleY data={firstHundred} y="Close" stroke="steelblue" strokeWidth={2} canvas />
		</Plot>
	</div>
</div>
