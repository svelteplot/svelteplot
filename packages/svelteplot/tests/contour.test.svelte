<script lang="ts">
    import { Contour, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    let {
        plotArgs = {},
        contourArgs
    }: {
        plotArgs?: ComponentProps<typeof Plot>;
        contourArgs: ComponentProps<typeof Contour>;
    } = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Contour {...contourArgs} />
</Plot>
