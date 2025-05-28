<script module type="ts">
    export type BrushXMarkProps = Omit<BrushMarkProps, 'limitDimension'>;
</script>

<script lang="ts">
    import Brush, { type BrushMarkProps } from './Brush.svelte';

    let { brush, ...restProps }: BrushXMarkProps = $props();
</script>

<Brush bind:brush limitDimension="x" {...restProps} />
