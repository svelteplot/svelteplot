<script module>
    export const title = 'Beeswarm plot';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { cars } = $derived(page.data.data) as ExamplesData;
</script>

<Plot height={200}>
    <Dot
        data={cars}
        x="weight (lb)"
        y={0}
        fill
        dodgeY="bottom" />
</Plot>
