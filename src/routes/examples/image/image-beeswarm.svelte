<script module>
    export const title = 'Image beeswarm';
    export const sortKey = 30;
    export const transforms = ['dodge'];
    export const data = {
        presidents2: '/data/presidents2.csv'
    };
    export const repl =
        'https://svelte.dev/playground/9fb9afe5e2fb4a6da5fa01f546db9a7a?version=latest';
</script>

<script lang="ts">
    import { Plot, Image } from 'svelteplot';
    import type { ExamplesData } from '../types';
    const { presidents2 } = $props() as ExamplesData;
</script>

<Plot
    height={(w) => Math.sqrt(1 / w) * 8e3}
    y={{ axis: false }}
    inset={20}>
    <Image
        data={presidents2}
        x="First Inauguration Date"
        dodgeY="bottom"
        y={0.01}
        src="Portrait URL"
        title="Name"
        r={20} />
</Plot>
