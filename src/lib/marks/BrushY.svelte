<script module type="ts">
    export type BrushYMarkProps = Omit<BrushMarkProps, 'limitDimension'>;
</script>

<script lang="ts">
    import Brush, { type BrushMarkProps } from './Brush.svelte';

    let { brush, ...restProps }: BrushYMarkProps = $props();
</script>

<Brush bind:brush limitDimension="y" {...restProps} />
