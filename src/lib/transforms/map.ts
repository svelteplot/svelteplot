import { identity } from '$lib/helpers/index.js';
import type {
    TransformArg,
    ScaledChannelName,
    MapIndexObject,
    MapOptions,
    MapMethod,
    DataRecord,
    Channels
} from '$lib/types/index.js';
import { count, rank } from 'd3-array';
import { groupFacetsAndZ } from '$lib/helpers/group.js';
import { resolveChannel } from '$lib/helpers/resolve.js';

export function map<T>(args: TransformArg<T>, options: MapOptions) {
    const { data, ...channels } = args;
    const newChannels: Channels = {};
    const newData: DataRecord[] = [];

    groupFacetsAndZ(data, channels, (groupedData) => {
        for (const [channel, map] of Object.entries(options)) {
            const mapper = maybeMap(map);
            const values = groupedData.map((d) =>
                resolveChannel(channel as ScaledChannelName, d, channels)
            );
            const indices = groupedData.map((d, i) => i);
            const mappedValues = new Array(values.length);
            mapper.mapIndex(indices, values, mappedValues);
            newChannels[channel] = `__${channel}`;
            for (let i = 0; i < values.length; ++i) {
                const datum = { ...groupedData[i], [`__${channel}`]: mappedValues[i] };
                newData.push(datum);
            }
        }
    });

    return { data: newData, ...channels, ...newChannels };
}

export function mapX<T>(args: TransformArg<T>, mapper: MapMethod) {
    let { x, x1, x2 } = args;
    if (x === undefined && x1 === undefined && x2 === undefined) args = { ...args, x: identity };
    const outputs: MapOptions = {};
    if (x != null) outputs.x = mapper;
    if (x1 != null) outputs.x1 = mapper;
    if (x2 != null) outputs.x2 = mapper;
    return map(args, outputs);
}

export function mapY<T>(args: TransformArg<T>, mapper: MapMethod) {
    let { y, y1, y2 } = args;
    if (y === undefined && y1 === undefined && y2 === undefined) args = { ...args, y: identity };
    const outputs: MapOptions = {};
    if (y != null) outputs.y = mapper;
    if (y1 != null) outputs.y1 = mapper;
    if (y2 != null) outputs.y2 = mapper;
    return map(args, outputs);
}

function maybeMap(map: MapMethod): MapIndexObject {
    if (map == null) throw new Error('missing map');
    if (typeof map === 'object' && typeof map.mapIndex === 'function') return map;
    if (typeof map === 'function') return mapFunction(map);
    switch (`${map}`.toLowerCase()) {
        case 'cumsum':
            return mapCumsum;
        case 'rank':
            return mapFunction((I, V) => rank(I, (i) => V[i]));
        case 'quantile':
            return mapFunction((I, V) => rankQuantile(I, (i) => V[i]));
    }
    throw new Error(`invalid map: ${map}`);
}

function rankQuantile(I: number[], f: (i: number) => any): number[] {
    const n = count(I, f) - 1;
    return rank(I, f).map((r) => r / n);
}

function mapFunction(f: (I: number[], S: number[]) => number[]): MapIndexObject {
    return {
        mapIndex(I: number[], S: number[], T: number[]) {
            const M = f(I, S);
            if (M.length !== I.length) throw new Error('map function returned a mismatched length');
            for (let i = 0, n = I.length; i < n; ++i) T[I[i]] = M[i];
        }
    };
}

const mapCumsum: MapIndexObject = {
    mapIndex(I: number[], S: number[], T: number[]) {
        let sum = 0;
        for (const i of I) T[i] = sum += S[i];
    }
};
