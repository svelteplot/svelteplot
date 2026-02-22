import IntervalTree from 'interval-tree-1d';
import { groupFacetsAndZ } from 'svelteplot/helpers/group';
import type { ScaledDataRecord, TransformArg, PlotState } from 'svelteplot/types';

type BaseDodgeOptions = {
    /** the anchor side for placing dodged marks */
    anchor?: string;
    /** the padding between dodged marks, in pixels */
    padding?: number;
    /** the radius of dodged marks, in pixels */
    r?: number;
};

type AnchorX = 'left' | 'right' | 'middle';
type AnchorY = 'top' | 'bottom' | 'middle';

/** options for horizontal dodge positioning; can be an anchor string or a full options object */
export type DodgeXOptions =
    | AnchorX
    | (BaseDodgeOptions & {
          anchor?: 'left' | 'right' | 'middle';
      });

/** options for vertical dodge positioning; can be an anchor string or a full options object */
export type DodgeYOptions =
    | AnchorY
    | (BaseDodgeOptions & {
          anchor?: 'top' | 'bottom' | 'middle';
      });

type AnchorFunction = (d: PlotState) => [number, number];

/**
 * offsets marks horizontally to avoid overlap, using circle-packing
 */
export function dodgeX(
    args: TransformArg<ScaledDataRecord>,
    plotState: PlotState
): ScaledDataRecord[] {
    if (!args.dodgeX) return args.data;
    let {
        anchor = 'left',
        padding = 1,
        r = (args.dodgeX as any)?.r
    } = maybeAnchor(args.dodgeX as any) as BaseDodgeOptions;
    let anchorFunction: AnchorFunction;
    switch (`${anchor}`.toLowerCase()) {
        case 'left':
            anchorFunction = anchorXLeft;
            break;
        case 'right':
            anchorFunction = anchorXRight;
            break;
        case 'middle':
            anchorFunction = anchorXMiddle;
            break;
        default:
            throw new Error(`unknown dodge anchor: ${anchor}`);
    }
    return dodge('x', 'y', anchorFunction, Number(padding), r, args, plotState);
}

/**
 * offsets marks vertically to avoid overlap, using circle-packing
 */
export function dodgeY(
    args: TransformArg<ScaledDataRecord>,
    plotState: PlotState
): ScaledDataRecord[] {
    if (!args.dodgeY) return args.data;
    let {
        anchor = 'bottom',
        padding = 1,
        r = (args.dodgeY as any)?.r
    } = maybeAnchor(args.dodgeY as any) as BaseDodgeOptions;
    let anchorFunction: AnchorFunction;
    switch (`${anchor}`.toLowerCase()) {
        case 'top':
            anchorFunction = anchorYTop;
            break;
        case 'bottom':
            anchorFunction = anchorYBottom;
            break;
        case 'middle':
            anchorFunction = anchorYMiddle;
            break;
        default:
            throw new Error(`unknown dodge anchor: ${anchor}`);
    }
    return dodge('y', 'x', anchorFunction, Number(padding), r, args, plotState);
}

function dodge(
    y: 'x' | 'y',
    x: 'x' | 'y',
    anchor: AnchorFunction,
    padding: number,
    r: number | undefined,
    { data, ...channels }: TransformArg<ScaledDataRecord>,
    plotState: PlotState
): ScaledDataRecord[] {
    if (r != null && typeof r !== 'number') {
        // use the r channel
        // let { channels, sort, reverse } = options;
        // channels = maybeNamed(channels);
        // if (channels?.r === undefined)
        //     options = { ...options, channels: { ...channels, r: { value: r, scale: 'r' } } };
        // if (sort === undefined && reverse === undefined) options.sort = { channel: '-r' };
    }
    const { fx, fy } = channels;
    let [ky, ty] = anchor(plotState);
    const compare = ky ? compareAscending : compareSymmetric;

    const cr = r !== undefined ? r : 3; // default radius if no r channel
    // group data by facets
    groupFacetsAndZ(data, { fx, fy }, (items: ScaledDataRecord[]) => {
        // apply dodge within each facet
        const tree = IntervalTree();
        const data = items.filter(
            (d) =>
                (typeof d.r !== 'number' || d.r >= 0) &&
                isFinite(d[x] as number) &&
                isFinite(d[y] as number)
        ) as { r: number; x: number; y: number }[];
        const intervals = new Float64Array(2 * data.length + 2);
        data.forEach((d: any, i: number) => {
            const ri = d.r ?? r ?? 3;
            const y0 = ky ? ri + padding : 0; // offset baseline for varying radius
            const l = d[x] - ri;
            const h = d[x] + ri;

            // The first two positions are 0 to test placing the dot on the baseline.
            let k = 2;

            // For any previously placed circles that may overlap this circle, compute
            // the y-positions that place this circle tangent to these other circles.
            // https://observablehq.com/@mbostock/circle-offset-along-line
            tree.queryInterval(l - padding, h + padding, (interval: [number, number, ...any[]]) => {
                const j = interval[2] as number;
                const yj = data[j][y] - y0;
                const dx = d[x] - data[j][x];
                const dr = padding + (channels.r ? d.r + data[j].r : 2 * cr);
                const dy = Math.sqrt(dr * dr - dx * dx);
                intervals[k++] = yj - dy;
                intervals[k++] = yj + dy;
            });

            // Find the best y-value where this circle can fit.
            let candidates = intervals.slice(0, k);
            if (ky) candidates = candidates.filter((y) => y >= 0);
            out: for (const diff of candidates.sort(compare)) {
                for (let j = 0; j < k; j += 2) {
                    if (intervals[j] + 1e-6 < diff && diff < intervals[j + 1] - 1e-6) {
                        continue out;
                    }
                }
                d[y] = diff + y0;
                break;
            }

            // Insert the placed circle into the interval tree.
            tree.insert([l, h, i]);
        });

        if (!ky) ky = 1;
        data.forEach((d) => (d[y] = d[y] * ky + ty));
    });

    return data;
}

function maybeAnchor(anchor: string | BaseDodgeOptions): BaseDodgeOptions {
    return typeof anchor === 'string' ? { anchor } : anchor;
}

function anchorXLeft({ options: { marginLeft } }: PlotState): [-1 | 0 | 1, number] {
    return [1, marginLeft];
}

function anchorXRight({
    facetWidth: width,
    options: { marginLeft }
}: PlotState): [-1 | 0 | 1, number] {
    return [-1, marginLeft + width];
}

function anchorXMiddle({
    facetWidth: width,
    options: { marginLeft }
}: PlotState): [-1 | 0 | 1, number] {
    return [0, marginLeft + width / 2];
}

function anchorYTop({ options: { marginTop } }: PlotState): [-1 | 0 | 1, number] {
    return [1, marginTop];
}

function anchorYBottom({ facetHeight: height }: PlotState): [-1 | 0 | 1, number] {
    return [-1, height];
}

function anchorYMiddle({
    facetHeight: height,
    options: { marginTop, marginBottom: _marginBottom }
}: PlotState): [-1 | 0 | 1, number] {
    return [0, (marginTop + height) / 2];
}

function compareSymmetric(a: number, b: number): number {
    return Math.abs(a) - Math.abs(b);
}

function compareAscending(a: number, b: number): number {
    return a - b;
}
