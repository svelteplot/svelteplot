<script lang="ts" module>
    export const sortKey = 99;
    export const title = 'CSS variable font size';
    export const repl =
        'https://svelte.dev/playground/a3d0f7df09ac4091a58cf95706763a04?version=5.33.19';
    export const description =
        'The font size and line height are being used to position multiline text in SVG. You can also use CSS variables to set the font size (currently only in <tt>px</tt> and <tt>rem</tt>).';
</script>

<script lang="ts">
    import { Plot, Text } from 'svelteplot';
    import Frame from 'svelteplot/marks/Frame.svelte';
</script>

<Plot axes={false}>
    <Frame borderRadius={20} strokeOpacity={0.25} />
    <Text
        fontSize="var(--my-font-size)"
        fill="var(--svp-accent)"
        fontWeight="bold"
        text={`SveltePlot\nis great`} />
</Plot>

<style>
    :root {
        --my-font-size: 3rem;
        @media screen and (max-width: 600px) {
            --my-font-size: 27px;
        }
    }
</style>
