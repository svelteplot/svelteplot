BLS Demo:

```svelte live
<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import type { Datasets } from '$lib/types/index.js';

    import { page } from '$app/state';
    let { bls } = $derived(page.data.data);
</script>

<Plot grid>
    <Line
        data={bls}
        x="date"
        y="unemployment"
        z="division"
        outlineStroke="var(--svelteplot-bg)"
        sort={(d) => /, MI /.test(d.division)}
        stroke={(d) =>
            /, MI /.test(d.division)
                ? 'red'
                : '#99999955'} />
</Plot>
```
