<script module>
    export const title = 'Dynamic border radius';
    export const description =
        'Bar chart with dynamic border radius based on data values.';
    export const sortKey = 400;
    export const repl =
        'https://svelte.dev/playground/ce307022f9a842d086d4cd3e5f0bfb2b?version=latest';
</script>

<script lang="ts">
    import { BarX, Plot } from 'svelteplot';
    const data = [
        { name: 'Muffins', value: 14 },
        { name: 'Apples', value: 7 },
        { name: 'Bananas', value: -21 },
        { name: 'Oranges', value: -10 },
        { name: 'Lemons', value: 3 },
        { name: 'Vegetables', value: -6 }
    ];
</script>

<Plot>
    <BarX
        {data}
        x="value"
        y="name"
        sort="value"
        borderRadius={(d) => {
            return d.value < 0
                ? { topLeft: 20, bottomLeft: 20 }
                : { topRight: 20, bottomRight: 20 };
        }} />
</Plot>
