<script module>
    export const title = 'Dot plot';
</script>

<script lang="ts">
    import { Plot, Dot, GridY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { languages } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    frame
    inset={20}
    x={{
        type: 'log',
        axis: 'both',
        label: 'NUMBER OF SPEAKERS',
        labelAnchor: 'center'
    }}
    y={{ type: 'point', label: '' }}>
    <GridY strokeDasharray="1,3" strokeOpacity={0.5} />
    <Dot
        data={languages.filter(
            (d) => d['Total speakers'] >= 70e6
        )}
        fill="currentColor"
        sort={{ channel: '-x' }}
        y="Language"
        x="Total speakers" />
</Plot>
