<script lang="ts">
    import { RuleY, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        ruleArgs: ComponentProps<typeof RuleY>;
    }

    let { plotArgs, ruleArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <RuleY {...ruleArgs} />
</Plot>
