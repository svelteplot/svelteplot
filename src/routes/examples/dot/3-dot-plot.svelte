<script module>
    export const title = 'Dot plot';
    export const description =
        'Recreation of an example dot chart from "The Elements of Graphing Data" by William Cleveland (1985) showing number of speakers for world languages with more than 70 million speakers on a log base 2 scale';
    export const data = {
        languages: '/data/languages.csv'
    };
    export const repl =
        'https://svelte.dev/playground/d1ccdd93145a4d8ca6b3c51714c84169?version=latest';
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
    y={{
        type: 'point',
        label: false,
        tickFormat: (d) => d.toUpperCase()
    }}>
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
