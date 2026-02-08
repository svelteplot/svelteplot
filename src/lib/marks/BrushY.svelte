<!--
    @component
    For creating a brush that can be dragged vertically
-->
<script lang="ts">
    import Brush from './Brush.svelte';
    import { type ComponentProps } from 'svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';

    interface BrushYMarkProps extends Omit<ComponentProps<typeof Brush>, 'limitDimension'> {}

    let { brush = $bindable({ enabled: false }), ...options }: BrushYMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().brush,
        ...getPlotDefaults().brushY
    };
</script>

<Brush bind:brush limitDimension="y" {...DEFAULTS} {...options} />
