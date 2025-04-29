<script>
    import { Line, Plot } from '$lib';
    let args = $props();
</script>

<Plot width={100} height={100} axes={false}>
    <Line {...args} />
</Plot>
