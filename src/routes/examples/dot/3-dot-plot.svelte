<script module>
    export const title = 'Dot plot';
    export const data = {
        languages: '/data/languages.csv'
    };
</script>

<script lang="ts">
    import { Plot, Dot, GridY } from 'svelteplot';
    import type { LanguagesRow } from '../types';
    let { languages }: { languages: LanguagesRow[] } =
        $props();
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
