---
title: Customizing colors
---

If we want to customize the colors we can create our own color scheme:

```js
const scheme = {
  Adelie: 'hotpink',
  Chinstrap: 'teal',
  Gentoo: 'orange'
};
```
and pass it to the `color` scale options:

```svelte
<Plot color={{ legend: true+++, scheme+++ }}>
```

Since the color scheme is managed by the Plot, we only have to define it once and it is applied everywhere consistently.
