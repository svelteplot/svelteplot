<script>
    import { Plot, Dot } from '$lib/index.js';

    let { colorOptions: color, dotOptions } = $props();
</script>

<Plot {color} width={100} height={100} axes={false}>
    <Dot {...dotOptions} />
</Plot>
