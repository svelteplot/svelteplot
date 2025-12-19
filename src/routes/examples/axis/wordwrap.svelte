<script module>
    export const title = 'Word wrap axis labels';
    export const description =
        'Demonstration of word-wrapping long axis labels to prevent overlap.';
    export const repl =
        'https://svelte.dev/playground/ad8ab15ecaa94777b78e55028093cfb1?version=latest';
</script>

<script>
    import { BarY, Plot } from 'svelteplot';

    const data = [
        {
            label: 'This is a very long label',
            value: 1
        },
        {
            label: 'I am also far too long',
            value: 2
        },
        {
            label: 'I will never fit on one line',
            value: 3
        },
        {
            label: 'And neither will I, I am so long',
            value: 4
        },
        {
            label: 'Please wrap this descriptive label too',
            value: 5
        },
        {
            label: 'Labels can go on multiple lines when needed',
            value: 7
        },
        {
            label: 'Wrapping long text prevents overlap',
            value: 8
        }
    ];
</script>

<Plot y={{ axis: false }}>
    <BarY {data} x="label" y="value" />
</Plot>
