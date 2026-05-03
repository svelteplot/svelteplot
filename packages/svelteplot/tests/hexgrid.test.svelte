<script lang="ts">
    import { Hexgrid, Plot } from 'svelteplot';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs?: ComponentProps<typeof Plot>;
        gridArgs?: ComponentProps<typeof Hexgrid>;
    }

    let { plotArgs, gridArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <Hexgrid {...gridArgs} />
</Plot>
