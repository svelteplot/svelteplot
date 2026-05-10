---
title: Data order
---

`Line` connects points in the order they appear in the data. If the data isn't sorted by x, you get a tangled mess.

The starter has AAPL data sorted by closing price instead of by date — notice how the line zigzags:

```svelte
// sorted by Close price, not by Date ↓
const unsorted = [...data].sort((a, b) => a.Close - b.Close);
```

Fix it by adding `sort="Date"` to the `Line` mark:

```svelte
<Line
  data={unsorted}
  x="Date"
  y="Close"
  +++sort="Date"+++
/>
```

`sort` re-orders the rows by the given column before drawing. It accepts a column name string or an accessor function — useful whenever you can't control the order of the source data.
