<script module lang="ts">
    export let title = 'Cell Plot';
</script>

<script lang="ts">
    import { Plot, Cell, Text } from 'svelteplot';
    import { page } from '$app/state';

    let { simpsons } = $derived(page.data.data) as {
        simpsons: {
            episode: string;
            season: string;
            /**
             * the imdb rating of the episode
             */
            imdb_rating: number;
            title: string;
        }[];
    };
</script>

<Plot
    grid
    padding={0}
    aspectRatio={1}
    marginTop={40}
    x={{ type: 'band', axis: 'top' }}
    y={{ type: 'band' }}
    color={{ type: 'quantile', scheme: 'PiYG' }}>
    <Cell
        data={simpsons}
        x="episode"
        y="season"
        fill="imdb_rating"
        inset={0.5} />
    <Text
        data={simpsons}
        y="season"
        x="episode"
        fill="black"
        text={(d) =>
            d.imdb_rating != null
                ? d.imdb_rating.toFixed(1)
                : null}
        title={(d) => d.title} />
</Plot>
