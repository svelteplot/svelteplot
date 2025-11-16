<script module>
    export const title = 'Binned Rectangles';
    export const description =
        'A simple example of a binned rectangle plot showing the distribution of Olympian weights.';
    export const sortKey = 20;
    export const transforms = ['bin'];
</script>

<script lang="ts">
    import { Plot, Rect, bin } from 'svelteplot';
    import { page } from '$app/state';
    import { getContext } from 'svelte';
    import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context';
    import type { SveltepressContext } from '@sveltepress/theme-default/context';
    import type { ExamplesData } from '../types';

    let { olympians } = $derived(
        page.data.data as ExamplesData
    );

    const { isDark } = getContext<SveltepressContext>(
        SVELTEPRESS_CONTEXT_KEY
    );
</script>

<Plot
    opacity={{
        range: [$isDark ? 0 : 0.4, 1],
        type: 'sqrt'
    }}
    color={{ scheme: $isDark ? 'magma' : 'rdpu' }}>
    <Rect
        {...bin(
            { data: olympians, x: 'weight', y: 'height' },
            { fill: 'count', opacity: 'count' }
        )}
        inset={0} />
</Plot>
