<script lang="ts">
    import { AreaY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        areaArgs: ComponentProps<typeof AreaY>;
    }

    let { plotArgs = {}, areaArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <AreaY {...areaArgs} />
  </Plot>

