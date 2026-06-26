<script lang="ts">
    import { Dot, Line, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        lineArgs: ComponentProps<typeof Line>;
        dotArgs: ComponentProps<typeof Dot>;
    }

    let { plotArgs = {}, lineArgs, dotArgs }: Props = $props();
</script>

<Plot width={200} height={200} axes={true} {...plotArgs}>
    <Line {...lineArgs} />
    <Dot {...dotArgs} />
</Plot>