---
title: Adding a rule
---

Now let's add a third mark, the `RuleY`. It adds a horizontal rule at specific `y` locations (hence the name Rule**Y**).

```svelte
<script>
	import { Plot, Line, AreaY+++, RuleY+++ } from 'svelteplot';
</script>
```

Then we can add a plot by adding these three lines to the markup:

```svelte
<Plot>
	<Line {data} x="Date" y="Close" />
	<AreaY {data} x="Date" y="Close" opacity={0.2} />
	+++<RuleY y={0} />+++
</Plot>
```

By the way, the `RuleY` mark can also receive data and a `y` channel. Then it will add multiple horizontal rules. You can try this, for fun:

```svelte
---<RuleY y={0} />---
+++<RuleY {data} y="Close" opacity={0.1} />+++
```
