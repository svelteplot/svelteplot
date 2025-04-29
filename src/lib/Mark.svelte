<script lang="ts">
    import { getContext, untrack, type Snippet } from 'svelte';

    import { CHANNEL_SCALE, INDEX } from '$lib/constants.js';
    import type {
        ScaledChannelName,
        MarkType,
        DataRecord,
        PlotContext,
        ChannelName,
        GenericMarkOptions,
        ChannelAccessor,
        BaseMarkProps,
        FacetContext,
        ScaleName,
        RawValue,
        ResolvedDataRecord,
        ScaledDataRecord,
        ScaleType
    } from './types.js';
    import { getUsedScales, projectXY, projectX, projectY } from './helpers/scales.js';
    import { testFilter, isValid } from '$lib/helpers/index.js';
    import { resolveChannel, resolveProp } from './helpers/resolve.js';

    type MarkProps = {
        data?: DataRecord[];
        automatic?: boolean;
        type: MarkType;
        channels?: ScaledChannelName[];
        required?: ScaledChannelName[];
        requiredScales?: Partial<Record<ScaleName, ScaleType[]>>;
        children?: Snippet<
            [
                {
                    mark: Mark<GenericMarkOptions>;
                    usedScales: ReturnType<typeof getUsedScales>;
                    scaledData: ScaledDataRecord[];
                }
            ]
        >;
        defaults?: Partial<Record<ScaledChannelName, RawValue>>;
    } & Partial<Record<ChannelName, ChannelAccessor>> &
        Partial<BaseMarkProps>;

    let {
        data = [],
        children,
        type,
        channels = [],
        required = [],
        requiredScales = {},
        defaults = {},
        ...options
    }: MarkProps = $props();

    const channelsWithFacets: ScaledChannelName[] = $derived([...channels, 'fx', 'fy']);

    const { addMark, updateMark, updatePlotState, removeMark, getTopLevelFacet, getPlotState } =
        getContext<PlotContext>('svelteplot');

    const plot = $derived(getPlotState());
    const facet = $derived(getTopLevelFacet());

    const { getFacetState } = getContext<FacetContext>('svelteplot/facet');
    const { left, top } = $derived(getFacetState());

    class Mark {
        id;
        type;
        channels: ScaledChannelName[] = $state.raw([]);
        scales: Set<ScaleName> = $state.raw(new Set());
        data: DataRecord[] = $state.raw([]);
        options: GenericMarkOptions = $state.raw({});

        constructor(type: MarkType) {
            this.id = Symbol();
            this.type = type;
        }
    }

    const mark = new Mark(type);

    $effect(() => {
        return () => {
            removeMark(mark);
            added = false;
        };
    });

    // let mark2 = $state(mark);
    const facetMode = $derived(options.facet || 'auto');

    const optionsWithAutoFacet = $derived({
        ...options,
        __firstFacet: left && top,
        ...(facet &&
        facet.data &&
        ((facetMode === 'auto' && facet.data === data) || facetMode === 'include')
            ? {
                  fx: facet.x,
                  fy: facet.y
              }
            : {})
    });

    let added = false;

    $effect(() => {
        if (added) return;
        // without using untrack() here we end up with inexplicable
        // circular dependency updates resulting in a stack overflow
        const channels = untrack(() => channelsWithFacets);
        mark.channels = channels;
        mark.scales = new Set(
            channels
                .filter((channel) => options[channel] !== 0)
                .map((channel) => CHANNEL_SCALE[channel])
        );
        mark.data = untrack(() => data);
        mark.options = untrack(() => optionsWithAutoFacet);
        addMark(mark);
        added = true;
    });

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    const testFacet = $derived(getTestFacet());

    const resolvedData: ResolvedDataRecord[] = $derived(
        data
            .map((d, i) => ({ ...d, [INDEX]: i }))
            .flatMap((row) => {
                const channels = options as Record<ChannelName, ChannelAccessor>;
                if (!testFacet(row, channels) || !testFilter(row, channels)) return [];
                const out: ResolvedDataRecord = {
                    datum: row
                };
                for (const [channel] of Object.entries(CHANNEL_SCALE) as [
                    ScaledChannelName,
                    ScaleName
                ][]) {
                    // check if the mark has defined an accessor for this channel
                    if (options?.[channel] !== undefined && out[channel] === undefined) {
                        // resolve value
                        out[channel] = resolveChannel(channel, row, options);
                    }
                }
                return [out];
            })
    );

    let prevResolvedData: ResolvedDataRecord[] = [];

    $effect(() => {
        if (isDifferent(resolvedData, prevResolvedData)) {
            prevResolvedData = resolvedData;
            // data has changed
            mark.data = data;
        }
    });

    function isDifferent(array1: ResolvedDataRecord[], array2: ResolvedDataRecord[]) {
        if (array1.length !== array2.length) return true;
        for (let i = 0; i < array1.length; i++) {
            for (const [channel] of Object.entries(CHANNEL_SCALE) as [
                ScaledChannelName,
                ScaleName
            ][]) {
                if (array1[i][channel] !== array2[i][channel]) return true;
            }
        }
        return false;
    }

    const errors = $derived([
        ...required
            .filter((name) => options[name] == null)
            .map((name) => `missing channel value for ${mark.type} mark: ${name}`),
        ...Object.entries(requiredScales)
            .filter(([scale, types]) => {
                return !types.includes(plot.scales[scale].type);
            })
            .map(
                ([scale, types]) => `scale type mismatch for ${scale} (needs ${types.join(' or ')})`
            )
    ]);

    $effect(() => {
        for (const name of required) {
            if (options[name] == null) throw new Error(`missing channel value: ${name}`);
        }
    });

    const usedScales = $derived(getUsedScales(plot, optionsWithAutoFacet, mark));
    /**
     * based on the data and the global scales we can now map the data
     * elements to the scales
     */
    const scaledData = $derived(
        resolvedData.flatMap((row) => {
            const out: ScaledDataRecord = {
                datum: row.datum,
                valid: true
            };
            // compute dx/dy
            const dx = Number(resolveProp<number>(options.dx, out.datum, 0));
            const dy = Number(resolveProp<number>(options.dy, out.datum, 0));

            // special handling if there's a projection, e.g. a line mark
            if (plot.scales.projection && mark.type !== 'geo') {
                for (const suffix of ['', '1', '2']) {
                    if (
                        options?.[`x${suffix}`] !== undefined &&
                        options?.[`y${suffix}`] !== undefined
                    ) {
                        // we have two-dimensional accessors
                        // for the x and y channels
                        const [x, y] =
                            mark.type === 'line'
                                ? [row.x, row.y] // line paths are projected later
                                : projectXY(
                                      plot.scales,
                                      row.x,
                                      row.y,
                                      usedScales.x,
                                      usedScales.y,
                                      suffix
                                  );
                        out[`x${suffix}`] = x;
                        out[`y${suffix}`] = y;
                        out.valid = out.valid && isValid(row.x) && isValid(row.y);
                    }
                }
            }

            // iterate over all scaled channels
            for (const [channel, scale] of Object.entries(CHANNEL_SCALE) as [
                ScaledChannelName,
                ScaleName
            ][]) {
                // check if the mark has defined an accessor for this channel
                if (options?.[channel] !== undefined && out[channel] === undefined) {
                    // resolve value
                    const value = row[channel];

                    const scaled = usedScales[channel]
                        ? scale === 'x'
                            ? projectX(channel as 'x' | 'x1' | 'x2', plot.scales, value)
                            : scale === 'y'
                              ? projectY(channel as 'y' | 'y1' | 'y1', plot.scales, value)
                              : plot.scales[scale].fn(value)
                        : value;

                    out.valid = out.valid && isValid(value);
                    // apply dx/dy transform
                    out[channel] =
                        scale === 'x' && Number.isFinite(scaled) ? (scaled as number) + dx : scaled;
                    out[channel] =
                        scale === 'y' && Number.isFinite(scaled) ? (scaled as number) + dy : scaled;
                } else if (defaults[channel]) {
                    out[channel] = defaults[channel];
                }
            }

            return [out];
        })
    );
</script>

{#if errors.length}
    <text transform="translate(10,10)">
        {#each errors as error, i}
            <tspan x="0" dy={i ? 14 : 0}>{error}</tspan>
        {/each}
    </text>
{:else if children}
    {@render children({
        mark,
        usedScales,
        scaledData
    })}
{/if}

<style>
    text {
        stroke: var(--plot-bg);
        fill: crimson;
        font-size: 11px;
        stroke-width: 3px;
        font-weight: bold;
        paint-order: stroke fill;
    }
</style>
