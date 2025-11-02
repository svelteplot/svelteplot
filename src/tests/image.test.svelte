<script lang="ts">
    import { Image as ImageMark, Plot } from '$lib/index.js';
    import type { ComponentProps } from 'svelte';

    interface Props {
        plotArgs: ComponentProps<typeof Plot>;
        imageArgs: ComponentProps<typeof ImageMark>;
    }

    let { plotArgs, imageArgs }: Props = $props();
</script>

<Plot width={100} height={100} axes={false} {...plotArgs}>
    <ImageMark {...imageArgs} />
  </Plot>

