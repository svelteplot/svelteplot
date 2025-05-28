<!-- 
    @component
    Wrapper around the vector mark with presets suitable for spike maps 
-->
<script module lang="ts">
    export type SpikeMarkProps = VectorMarkProps;
</script>

<script lang="ts">
    import Vector, { type VectorMarkProps } from './Vector.svelte';
    let { data = [{}], ...options }: SpikeMarkProps = $props();
</script>

<Vector
    {data}
    fill={options.stroke || 'currentColor'}
    fillOpacity={0.3}
    strokeWidth={1}
    anchor="start"
    stroke="currentColor"
    sort={{ channel: '-y' }}
    {...options}
    shape="spike" />
