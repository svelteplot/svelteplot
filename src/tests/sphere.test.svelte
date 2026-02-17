<script lang="ts">
    import { Sphere, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';
    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        sphereArgs?: ComponentProps<typeof Sphere>;
    }
    let { plotArgs = {}, sphereArgs = {} }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Sphere {...sphereArgs} />
</Plot>
