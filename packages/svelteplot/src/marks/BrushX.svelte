<!--
    @component
    For creating a brush that can be dragged horizontally
-->
<script lang="ts">
    interface BrushXMarkProps extends Omit<ComponentProps<typeof Brush>, 'limitDimension'> {}

    import Brush from './Brush.svelte';
    import { type ComponentProps } from 'svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    let { brush = $bindable({ enabled: false }), ...options }: BrushXMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().brush,
        ...getPlotDefaults().brushX
    };
</script>

<Brush bind:brush limitDimension="x" {...DEFAULTS} {...options} />
