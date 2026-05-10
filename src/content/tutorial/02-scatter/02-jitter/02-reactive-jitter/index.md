---
title: Reactive jitter
---

Because `$derived` re-runs whenever its dependencies change, any reactive variable you reference inside the transform will update the chart automatically.

Add a `$state` variable for the jitter width and wire it to a range input:

```svelte
+++let width = $state(0.45);+++
```

```svelte
const jittered = $derived(
---  jitterX({ data, x: 'cylinders', y: 'power (hp)' }, { type: 'uniform', width: 0.45 })---
+++  jitterX({ data, x: 'cylinders', y: 'power (hp)' }, { type: 'uniform', width })+++
);
```

```svelte
+++<label>
  Spread: <input type="range" bind:value={width} min={0} max={0.5} step={0.05} />
</label>+++
```

Move the slider to control how spread out the jitter is. Since `$derived` calls `Math.random` anew on every re-run, the dot positions also reshuffle each time — the jitter is never the same twice.
