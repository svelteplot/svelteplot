<script lang="ts">
    import { Text, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        textArgs: ComponentProps<typeof Text>;
    }

    let { plotArgs, textArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Text {...textArgs} />
</Plot>