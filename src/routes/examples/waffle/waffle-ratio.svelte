<script module>
    export let title = 'Waffle 1:1 Ratio';
    export let description = `To keep waffle cells square within a fixed container, we calculate the Plot dimensions using the correct aspect ratio. This formula accounts for margins, band padding, <code>unit</code> (value per cell), and <code>multiple</code> (cells per row). Drag the bottom-right corner of the box to resize and test responsiveness.`
</script>

<script>
    import { Plot, WaffleY, RuleY } from 'svelteplot';

    const bandPadding = 0.2; // padding between bands (x-axis)
    const marginTop = 40;
    const marginBottom = 50;
    const marginLeft = 40;
    const marginRight = 10;

    const multiple = 5;
    const unit = 10;

    const data = [
        { fruit: 'Apples', quantity: 150 },
        { fruit: 'Banana', quantity: 52 }
        // { fruit: 'Apples', quantity: 152 }
        // { fruit: 'Bananas', quantity: 207 },
        // { fruit: 'Cherries', quantity: 315 },
        // { fruit: 'Dates', quantity: 11 }
    ]
        // Required if only complete icons should be rendered
        .map((d) => ({
            ...d,
            quantity: Math.round(d.quantity / unit) * unit
        }));

    const categories = data.length;

    // Calculate yDomain based on actual data - must fit all waffle cells
    // Round up to nearest (unit * multiple) for clean rows
    const maxValue = Math.max(
        ...data.map((d) => d.quantity)
    );
    const rowHeight = unit * multiple; // each row represents this many units
    const yDomain =
        Math.ceil(maxValue / rowHeight) * rowHeight;

    // Initial container dimensions
    const initialHeight = 500;
    const initialWidth = initialHeight * 2;

    // Track container dimensions
    let containerWidth = $state(initialWidth);
    let containerHeight = $state(initialHeight);

    const correctAspectRatio = $derived(
        ((categories + bandPadding) *
            unit *
            multiple *
            multiple) /
            (yDomain * (1 - bandPadding))
    );

    // Calculate plot dimensions to fit container while maintaining aspect ratio
    // Account for margins in the calculation
    const plotDimensions = $derived.by(() => {
        const maxInnerWidth =
            containerWidth - marginLeft - marginRight;
        const maxInnerHeight =
            containerHeight - marginTop - marginBottom;

        // Calculate what inner height would be needed for full inner width
        const innerHeightForFullWidth =
            maxInnerWidth / correctAspectRatio;

        if (innerHeightForFullWidth <= maxInnerHeight) {
            // Width-constrained: use full width
            return {
                width: containerWidth,
                height:
                    innerHeightForFullWidth +
                    marginTop +
                    marginBottom
            };
        } else {
            // Height-constrained: use full height
            const innerWidth =
                maxInnerHeight * correctAspectRatio;
            return {
                width:
                    innerWidth + marginLeft + marginRight,
                height: containerHeight
            };
        }
    });
</script>

<h3>Responsive Waffle Chart with 1:1 Aspect Ratio</h3>

<p>
    To keep waffle cells square within a fixed container, we
    calculate the Plot dimensions using the correct aspect
    ratio. This formula accounts for margins, band padding,
    <code>unit</code> (value per cell), and
    <code>multiple</code> (cells per row).
</p>

<p>
    Drag the bottom-right corner of the box to resize and
    test responsiveness.
</p>

<div
    class="resizable-container"
    style:height="{initialHeight}px"
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}>
    <Plot
        grid
        {marginTop}
        {marginBottom}
        {marginLeft}
        {marginRight}
        width={plotDimensions.width}
        height={plotDimensions.height}
        x={{ padding: bandPadding }}
        y={{ domain: [0, yDomain] }}>
        <RuleY data={[0]} />
        <WaffleY
            {data}
            {multiple}
            {unit}
            x="fruit"
            y="quantity"
            gap={2}
            fill="lightblue"
            borderRadius={100} />
    </Plot>
</div>

<style>
    .resizable-container {
        width: 100%;
        border: 1px dashed slategrey;
        display: flex;
        justify-content: center;
        align-items: center;
        resize: both;
        overflow: auto;
        min-width: 300px;
        min-height: 150px;
        box-sizing: border-box;
    }
</style>
