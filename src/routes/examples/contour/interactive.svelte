<script module>
    export const title = 'Interactive swirl';
    export const description =
        'An animated field of interference bands warped by a swirl lens centered on the cursor. The domain warp, rotating swirl, and layered wave sources combine to produce patterns that change shape as you move the mouse.';
    export const sortKey = 32;
</script>

<script lang="ts">
    import { Plot, Contour, Frame } from 'svelteplot';

    // Default: cursor at (1, 0) — symmetric starting position
    let cx = $state(1);
    let cy = $state(0);
</script>

<Plot
    y={{ reverse: true }}
    color={{ scheme: 'ylorrd' }}
    height={450}
    axes={false}>
    <Contour
        value={(x: number, y: number) => {
            // If you have time available, pass it in / close over it
            const t = performance.now() * 0.001;

            // --- small domain warp (subtle, keeps it "wallpaper-y")
            const warpA = 0.01; // 0.03..0.10
            const warpF = 2.0; // 6..14
            const wx =
                x + warpA * Math.sin(warpF * y + 0.9 * t);
            const wy =
                y + warpA * Math.sin(warpF * x - 0.8 * t);

            // --- swirl lens around cursor (turns circles into spirals)
            let dx = wx - cx;
            let dy = wy - cy;
            const r = Math.hypot(dx, dy) + 1e-6;

            // swirl angle: strong near cursor, fades with distance
            const A = 2.4; // swirl strength (1.5..3.5)
            const falloff = 3.0; // higher => more localized swirl
            const a =
                (A * Math.sin(1.4 * t + 8.0 * r)) /
                (1.0 + falloff * r);

            const ca = Math.cos(a),
                sa = Math.sin(a);
            const sx = cx + (ca * dx - sa * dy);
            const sy = cy + (sa * dx + ca * dy);

            // --- your original idea, but with nicer structure
            // anchor a fixed source at (-0.35, 0) instead of (-1, 0) to keep it in-frame
            const ax = sx + 0.35;
            const ay = sy;

            const f =
                Math.sin(
                    6.0 * Math.hypot(ax, ay) + 0.6 * t
                ) +
                Math.cos(
                    7.0 * Math.hypot(sx - cx, sy - cy) -
                        0.8 * t
                ) +
                0.6 *
                    Math.sin(10.0 * sx) *
                    Math.sin(10.0 * sy);

            // --- banding: makes tons of contour lines from one implicit level
            // If your Contour draws multiple iso-levels internally, you can return `f` directly.
            const tau = 3.2; // 2..6
            return Math.sin(tau * f);
        }}
        x1={-0.25}
        x2={0.25}
        y1={-0.25}
        y2={0.25}
        fill="value"
        stroke="none"
        pixelSize={5} />
    <Frame
        fill="transparent"
        stroke="none"
        onmousemove={(evt) => {
            // track cursor position
            const e = evt as unknown as MouseEvent;
            cx = Number(e.dataX ?? cx);
            cy = Number(e.dataY ?? cy);
        }} />
</Plot>
