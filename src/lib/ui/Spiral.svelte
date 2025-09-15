<script>
    let { numTurns = 4, finalRadius = 10, duration = 2, ...restProps } = $props();

    const pathD = $derived.by(() => {
        const numPoints = 100;
        const k = finalRadius / (2 * Math.PI * numTurns);
        const angleStep = (2 * Math.PI * numTurns) / numPoints;

        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i * angleStep;
            const r = k * t;
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);
            points.push([x, y]);
        }

        let d = `M ${points[0][0].toFixed(2)},${points[0][1].toFixed(2)} `;
        for (let i = 1; i < points.length; i++) {
            d += `L ${points[i][0].toFixed(2)},${points[i][1].toFixed(2)} `;
        }
        return d.trim();
    });
</script>

<path
    d={pathD}
    style:animation-duration="{duration}s"
    stroke="currentColor"
    fill="none"
    {...restProps} />
