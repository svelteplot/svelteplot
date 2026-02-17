---
title: Transforms API reference
---

<div class="inline-toc">

Jump to transforms: [bin](/api/transforms#bin), [binX](/api/transforms#binX), [binY](/api/transforms#binY), [bollingerX](/api/transforms#bollingerX), [bollingerY](/api/transforms#bollingerY), [geoCentroid](/api/transforms#geoCentroid), [densityX](/api/transforms#densityX), [densityY](/api/transforms#densityY), [filter](/api/transforms#filter), [map](/api/transforms#map), [mapX](/api/transforms#mapX), [mapY](/api/transforms#mapY), [normalizeX](/api/transforms#normalizeX), [normalizeY](/api/transforms#normalizeY), [normalizeParallelX](/api/transforms#normalizeParallelX), [normalizeParallelY](/api/transforms#normalizeParallelY), [group](/api/transforms#group), [groupX](/api/transforms#groupX), [groupY](/api/transforms#groupY), [groupZ](/api/transforms#groupZ), [intervalX](/api/transforms#intervalX), [intervalY](/api/transforms#intervalY), [jitter](/api/transforms#jitter), [jitterX](/api/transforms#jitterX), [jitterY](/api/transforms#jitterY), [recordizeX](/api/transforms#recordizeX), [recordizeY](/api/transforms#recordizeY), [renameChannels](/api/transforms#renameChannels), [replaceChannels](/api/transforms#replaceChannels), [select](/api/transforms#select), [selectFirst](/api/transforms#selectFirst), [selectLast](/api/transforms#selectLast), [selectMaxX](/api/transforms#selectMaxX), [selectMaxY](/api/transforms#selectMaxY), [selectMinX](/api/transforms#selectMinX), [selectMinY](/api/transforms#selectMinY), [shiftX](/api/transforms#shiftX), [shiftY](/api/transforms#shiftY), [sort](/api/transforms#sort), [shuffle](/api/transforms#shuffle), [reverse](/api/transforms#reverse), [stackX](/api/transforms#stackX), [stackY](/api/transforms#stackY), [stackMosaicX](/api/transforms#stackMosaicX), [stackMosaicY](/api/transforms#stackMosaicY), [windowX](/api/transforms#windowX), [windowY](/api/transforms#windowY)

</div>

## bin

for binning in x and y dimension simultaneously

```ts
bin<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinOptions): TransformArg<T, DataRecord>
```

### BinOptions

```ts
type BinOptions = BinBaseOptions & AdditionalOutputChannels;
```

### BinBaseOptions

| Prop          | Type                                                                      | Description |
| ------------- | ------------------------------------------------------------------------- | ----------- |
| `domain?`     | [ number, number ]                                                        |             |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |             |
| `interval?`   | number \| string                                                          |             |
| `cumulative?` | false \| 1 \| -1                                                          |             |
| `reverse?`    | boolean                                                                   |             |

### NamedThresholdsGenerator

- `auto`
- `scott`
- `sturges`
- `freedman-diaconis`

### AdditionalOutputChannels

| Prop            | Type          | Description |
| --------------- | ------------- | ----------- |
| `fill`          | ReducerOption |             |
| `stroke`        | ReducerOption |             |
| `r`             | ReducerOption |             |
| `opacity`       | ReducerOption |             |
| `fillOpacity`   | ReducerOption |             |
| `strokeOpacity` | ReducerOption |             |

### ReducerOption

```ts
type ReducerOption =
    | ReducerName
    | ((group: DataRecord[]) => RawValue);
```

### ReducerName

```ts
export type ReducerName =
    | 'count'
    | 'deviation'
    | 'difference'
    | 'first'
    | 'last'
    | 'max'
    | 'mean'
    | 'median'
    | 'min'
    | 'mode'
    | 'ratio'
    | 'sum'
    | 'variance'
    | ReducerPercentile;
```

### ReducerPercentile

```ts
export type ReducerPercentile =
    | (`p${Digit}${Digit}` & Record<never, never>)
    | 'p25'
    | 'p50'
    | 'p75';
```

## binX

Bins on x. Also groups on y and the first channel of z, fill, or stroke, if any.

```ts
binX<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinXOptions): TransformArg<T, DataRecord>
```

### BinXOptions

```ts
export type BinXOptions = BinBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        y: ReducerOption;
        y1: ReducerOption;
        y2: ReducerOption;
    }>;
```

Uses: [BinBaseOptions](/api/transforms#BinBaseOptions), [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

## binY

Bins on y. Also groups on y and the first channel of z, fill, or stroke, if any.

```ts
binY<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinYOptions): TransformArg<T, DataRecord>
```

### BinYOptions

```ts
export type BinYOptions = BinBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        x: ReducerOption;
        x1: ReducerOption;
        x2: ReducerOption;
    }>;
```

Uses: [BinBaseOptions](/api/transforms#BinBaseOptions), [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

## bollingerX

computes Bollinger bands for the x channel, producing x1 (lower), x (mean),
and x2 (upper) channels

```ts
bollingerX<T>(args: TransformArg<T>, options: BollingerOptions): TransformArg<T>
```

### BollingerOptions

| Prop | Type   | Description                                                                             |
| ---- | ------ | --------------------------------------------------------------------------------------- |
| `n?` | number | the window size (the window transform’s k option), an integer; defaults to 20           |
| `k?` | number | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

## bollingerY

computes Bollinger bands for the y channel, producing y1 (lower), y (mean),
and y2 (upper) channels

```ts
bollingerY<T>(args: TransformArg<T>, options: BollingerOptions): TransformArg<T>
```

Options: [BollingerOptions](/api/transforms#BollingerOptions)

## geoCentroid

computes the geographic centroid of each geometry feature, producing
x (longitude) and y (latitude) channels

```ts
geoCentroid<Datum extends DataRecord>({
    data,
    ...options
}: {
    data: Datum[];
} & TransformArg<Datum>): TransformArg<WithCentroid<Datum>>
```

## densityX

One-dimensional kernel density estimation

```ts
densityX<T>(args: TransformArg<T>, options: DensityOptions<T> & {
    channel?: 'y' | 'y1' | 'y2';
}): TransformArg<T>
```

### DensityOptions

| Prop          | Type                                      | Description                                                                                                            |
| ------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `kernel?`     | Kernel                                    | The kernel function to use for smoothing.                                                                              |
| `bandwidth?`  | number \| ((data: number[]) =&gt; number) | The bandwidth to use for smoothing. Can be a fixed number or a function that computes the bandwidth based on the data. |
| `interval?`   | number \| string                          | If an interval is provided, the smoothing will be computed over that interval instead of the raw data points.          |
| `trim?`       | boolean                                   | If true, the density values will be trimmed to the range of the data.                                                  |
| `cumulative?` | false \| 1 \| -1                          | If true, the density values will be cumulative.                                                                        |

### Kernel

```ts
type Kernel =
    | 'uniform'
    | 'triangular'
    | 'epanechnikov'
    | 'quartic'
    | 'triweight'
    | 'gaussian'
    | 'cosine'
    | ((u: number) => number);
```

## densityY

One-dimensional kernel density estimation

```ts
densityY<T>(args: TransformArg<T>, options: DensityOptions<T> & {
    channel?: 'x' | 'x1' | 'x2';
}): TransformArg<T>
```

Options: [DensityOptions](/api/transforms#DensityOptions)

## filter

Filters data based on a function provided via `filter` channels.

```ts
filter<T>({ data, ...channels }: TransformArg<T>): TransformArg<T>
```

## map

Maps one or more positional channels using specified mapping methods.

```ts
map<T>(args: TransformArg<T>, options: MapOptions): void
```

### MapOptions

An object specifying mapping methods for one or more scaled channels
e.g. `{ x: 'rank' }`

```ts
export type MapOptions = Partial<
    Record<ScaledChannelName, MapMethod>
>;
```

### MapMethod

a named map method, a custom mapping function, or a MapIndexObject

```ts
export type MapMethod =
    | 'cumsum'
    | 'rank'
    | 'quantile'
    | ((I: number[], S: number[]) => number[])
    | MapIndexObject;
```

### MapIndexObject

an object implementing the mapIndex interface for custom map transforms

| Prop       | Type             | Description                                        |
| ---------- | ---------------- | -------------------------------------------------- |
| `mapIndex` | MapIndexFunction | the function that performs the index-based mapping |

### MapIndexFunction

a function that maps source values (S) to target values (T) for the given indices (I)

```ts
export type MapIndexFunction = (
    I: number[],
    S: RawValue[],
    T: RawValue[]
) => void;
```

## mapX

Maps the x channel values using the specified mapping method.

```ts
mapX<T>(args: TransformArg<T>, mapper: MapMethod): void
```

## mapY

Maps the y channel values using the specified mapping method.

```ts
mapY<T>(args: TransformArg<T>, mapper: MapMethod): void
```

## normalizeX

Normalizes the x values based on the specified basis. Uses mapX.

```ts
normalizeX<T>(args: TransformArg<T>, options: NormalizeOptions): void
```

### NormalizeOptions

```ts
type NormalizeOptions =
    | NormalizeBasis
    | {
          basis: NormalizeBasis;
      };
```

### NormalizeBasis

```ts
type NormalizeBasis =
    | 'deviation'
    | 'first'
    | 'last'
    | 'min'
    | 'max'
    | 'mean'
    | 'median'
    | 'sum'
    | 'extent'
    | BasisFunction
    | MapIndexObject;
```

Uses: [MapIndexObject](/api/transforms#MapIndexObject)

### BasisFunction

```ts
type BasisFunction = (I: number[], S: RawValue[]) => number;
```

## normalizeY

Normalizes the y values based on the specified basis. Uses mapY.

```ts
normalizeY<T>(args: TransformArg<T>, options: NormalizeOptions): void
```

Options: [NormalizeOptions](/api/transforms#NormalizeOptions)

## normalizeParallelX

Convenience wrapper for normalizeY for parallel coordinates.

Channels:

- x: the categorical axis (e.g., 'Measurement')
- y: the value to normalize (e.g., 'Value')
- z: the grouping variable (e.g., 'Id')

```ts
normalizeParallelX<T>(args: TransformArg<T>, basis: NormalizeBasis): ReturnType<typeof sort<T>>
```

## normalizeParallelY

Convenience wrapper for normalizeY for parallel coordinates.

Channels:

- x: the categorical axis (e.g., 'Measurement')
- y: the value to normalize (e.g., 'Value')
- z: the grouping variable (e.g., 'Id')

```ts
normalizeParallelY<T>(args: TransformArg<T>, basis: NormalizeBasis): ReturnType<typeof sort<T>>
```

## group

groups the dataset by x and y channel and optionally reduces the group items
to output channels fill, stroke, r, opacity, fillOpacity, or strokeOpacity

```ts
group({ data, ...channels }: TransformArg<T, DataRecord>, options: GroupXOptions): void
```

### GroupXOptions

```ts
type GroupXOptions = GroupBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        y: ReducerOption;
        y1: ReducerOption;
        y2: ReducerOption;
        xPropName: string;
    }>;
```

Uses: [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

### GroupBaseOptions

| Prop          | Type                                                                      | Description                                          |
| ------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `domain?`     | [ number, number ]                                                        |                                                      |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |                                                      |
| `interval?`   | number \| string                                                          |                                                      |
| `cumulative?` | false \| 1 \| -1                                                          |                                                      |
| `reverse?`    | boolean                                                                   |                                                      |
| `copy?`       | string[]                                                                  | copy properties from the first element of each group |

Uses: [NamedThresholdsGenerator](/api/transforms#NamedThresholdsGenerator)

## groupX

groups the dataset by the x channel and optionally reduces the group items
to output channels y, y1, y2, fill, stroke, r, opacity, fillOpacity, or strokeOpacity

```ts
groupX(input: TransformArg<T, DataRecord>, options: GroupXOptions): void
```

Options: [GroupXOptions](/api/transforms#GroupXOptions)

## groupY

groups the dataset by the y channel and optionally reduces the group items
to output channels x, x1, x2, fill, stroke, r, opacity, fillOpacity, or strokeOpacity

```ts
groupY(input: TransformArg<T, DataRecord>, options: GroupYOptions): void
```

### GroupYOptions

```ts
type GroupYOptions = GroupBaseOptions &
    AdditionalOutputChannels &
    Partial<{
        x: ReducerOption;
        x1: ReducerOption;
        x2: ReducerOption;
        yPropName: string;
    }>;
```

Uses: [GroupBaseOptions](/api/transforms#GroupBaseOptions), [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

## groupZ

groups the dataset by the z channel and optionally reduces the group items
to output channels x, x1, x2, y, y1, y2, fill, stroke, r, opacity, fillOpacity,
or strokeOpacity

```ts
groupZ(input: TransformArg<T, DataRecord>, options: GroupZOptions): void
```

### GroupZOptions

```ts
type GroupZOptions = GroupXOptions | GroupYOptions;
```

Uses: [GroupXOptions](/api/transforms#GroupXOptions), [GroupYOptions](/api/transforms#GroupYOptions)

## intervalX

Derives interval channels x1 and x2 from the x channel and interval channel.

```ts
intervalX<T>(args: TransformArg<T>): void
```

## intervalY

Derives interval channels y1 and y2 from the y channel and interval channel.

```ts
intervalY<T>(args: TransformArg<T>): void
```

## jitter

adds random noise to one or more positional channels

```ts
jitter<T, C extends TransformArg<T>>({ data, ...channels }: C, options: Partial<Record<PositionalScale, JitterOptions>>): TransformReturn<C, T>
```

### JitterOptions

```ts
type JitterOptions = {
    source?: () => number;
} & (
    | {
          type: 'uniform';
          width?: number | string;
      }
    | {
          type: 'normal';
          std?: number | string;
      }
);
```

## jitterX

adds random noise to the x channel values

```ts
jitterX<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'x'>
```

Options: [JitterOptions](/api/transforms#JitterOptions)

## jitterY

adds random noise to the y channel values

```ts
jitterY<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'y'>
```

Options: [JitterOptions](/api/transforms#JitterOptions)

## recordizeX

takes an array of raw values and returns data records in which the values
are interpreted as the x channel and their index as the y channel

```ts
recordizeX<T>({ data, ...channels }: TransformArgsRow<DataRow>, { withIndex }: unknown): TransformArgsRecord<DataRecord>
```

## recordizeY

takes an array of raw values and returns data records in which the values
are interpreted as the y channel and their index as the x channel

```ts
recordizeY<T>({ data, ...channels }: TransformArgsRow<DataRow>, { withIndex }: unknown): TransformArgsRecord<DataRecord>
```

## renameChannels

renames a channel without modifying the data

```ts
renameChannels<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: RenameChannelsOptions): TransformArg<T, DataRecord>
```

### RenameChannelsOptions

```ts
type RenameChannelsOptions = Partial<
    Record<ScaledChannelName, ScaledChannelName>
>;
```

## replaceChannels

copies a channel's accessor to multiple target channels, then removes
the source channel

```ts
replaceChannels<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: ReplaceChannelsOptions): TransformArg<T, DataRecord>
```

### ReplaceChannelsOptions

```ts
type ReplaceChannelsOptions = Partial<
    Record<ScaledChannelName, ScaledChannelName[]>
>;
```

## select

selects one datum per group based on the given criteria; use "first"/"last"
for positional selection, or `{channel: "min"/"max"}` for value-based selection

```ts
select({ data, ...channels }: TransformArg<DataRecord>, options: SelectOptions): void
```

### SelectOptions

```ts
type SelectOptions =
    | 'first'
    | 'last'
    | AtLeastOne<{
          [k in ChannelName]: 'min' | 'max';
      }>;
```

### AtLeastOne

```ts
type AtLeastOne<
    T,
    U = {
        [K in keyof T]: Pick<T, K>;
    }
> = Partial<T> & U[keyof U];
```

## selectFirst

Keeps only the first item of each group

```ts
selectFirst(args: TransformArg<DataRecord>): void
```

## selectLast

Keeps only the last item of each group

```ts
selectLast(args: TransformArg<DataRecord>): void
```

## selectMaxX

keeps only the datum with the largest x value per group

```ts
selectMaxX(args: TransformArg<DataRecord>): void
```

## selectMaxY

keeps only the datum with the largest y value per group

```ts
selectMaxY(args: TransformArg<DataRecord>): void
```

## selectMinX

keeps only the datum with the smallest x value per group

```ts
selectMinX(args: TransformArg<DataRecord>): void
```

## selectMinY

keeps only the datum with the smallest y value per group

```ts
selectMinY(args: TransformArg<DataRecord>): void
```

## shiftX

shifts the x channel values by a fixed amount or time interval

```ts
shiftX({ data, ...channels }: TransformArg<DataRecord>, shiftBy: string | number | RequireAtLeastOne<ShiftXOptions>): TransformArg<DataRecord>
```

### ShiftXOptions

per-channel shift amounts for x channels; values can be numbers or time interval strings (e.g. "1 month")

```ts
type ShiftXOptions = {
    [key in 'x' | 'x1' | 'x2']: string | number;
};
```

## shiftY

shifts the y channel values by a fixed amount or time interval

```ts
shiftY({ data, ...channels }: TransformArg<DataRecord>, shiftBy: string | number | RequireAtLeastOne<ShiftYOptions>): TransformArg<DataRecord>
```

### ShiftYOptions

per-channel shift amounts for y channels; values can be numbers or time interval strings (e.g. "1 month")

```ts
type ShiftYOptions = {
    [key in 'y' | 'y1' | 'y2']: string | number;
};
```

## sort

sorts the data according to the sort channel option; supports channel
accessors, comparator functions, and `{channel, order}` objects

```ts
sort<T>({ data, ...channels }: TransformArg<T>, options: {
    reverse?: boolean;
}): void
```

## shuffle

shuffles the data row order

```ts
shuffle({ data, ...channels }: TransformArg<DataRow[]>, options: {
    seed?: number;
}): void
```

## reverse

reverses the data row order

```ts
reverse({ data, ...channels }: TransformArg<DataRow[]>): void
```

## stackX

stacks data along the x dimension, producing x1 and x2 channels

```ts
stackX<T>({ data, ...channels }: TransformArg<T>, opts: Partial<StackOptions>): TransformArg<T>
```

### StackOptions

options for the stack transform, or false to disable stacking

```ts
export type StackOptions =
    | {
          offset: null | StackOffset;
          order: null | StackOrder;
          reverse: boolean;
      }
    | false;
```

### StackOffset

the offset method used to position stacked values

- `none`
- `wiggle`
- `center`
- `normalize`
- `diverging`

### StackOrder

the order in which series are stacked

- `none`
- `appearance`
- `inside-out`
- `sum`

## stackY

stacks data along the y dimension, producing y1 and y2 channels

```ts
stackY<T>({ data, ...channels }: TransformArg<T>, opts: Partial<StackOptions>): TransformArg<T>
```

Options: [StackOptions](/api/transforms#StackOptions)

## stackMosaicX

creates a mosaic layout with the outer (width) dimension along x and
the inner (height) dimension along y

```ts
stackMosaicX<T>(args: unknown, opts: unknown): void
```

## stackMosaicY

creates a mosaic layout with the outer (height) dimension along y and
the inner (width) dimension along x

```ts
stackMosaicY<T>(args: unknown, opts: unknown): void
```

## windowX

applies a sliding window reducer to the x channel

```ts
windowX(args: TransformArg<DataRecord>, options: WindowOptions): void
```

### WindowOptions

| Prop       | Type                         | Description                                                                     |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `k`        | number                       | the window size (number of data points)                                         |
| `interval` | string                       | a time interval string to use instead of a fixed window size                    |
| `anchor`   | 'start' \| 'middle' \| 'end' | where to align the window relative to the current data point                    |
| `reduce`   | ReducerName                  | the reducer function to apply within each window (e.g. "mean", "median", "sum") |
| `strict`   | boolean                      | if true, return null when the window has fewer than k values                    |

Uses: [ReducerName](/api/transforms#ReducerName)

## windowY

applies a sliding window reducer to the y channel

```ts
windowY(args: TransformArg<DataRecord>, options: WindowOptions): void
```

Options: [WindowOptions](/api/transforms#WindowOptions)

## Type details

### GenericMarkOptions

a generic record type used when the specific mark options type is not known

```ts
export type GenericMarkOptions = Record<
    string | symbol,
    any
>;
```

### CurveName

the name of a d3 curve interpolation method

- `basis`
- `basis-closed`
- `basis-open`
- `bundle`
- `bump-x`
- `bump-y`
- `cardinal`
- `cardinal-closed`
- `cardinal-open`
- `catmull-rom`
- `catmull-rom-closed`
- `catmull-rom-open`
- `linear`
- `linear-closed`
- `monotone-x`
- `monotone-y`
- `natural`
- `step`
- `step-after`
- `step-before`

### MarkerOptions

| Prop           | Type                              | Description                                                     |
| -------------- | --------------------------------- | --------------------------------------------------------------- |
| `markerStart?` | boolean \| MarkerShape \| Snippet | the marker for the starting point of a line segment             |
| `markerMid?`   | boolean \| MarkerShape \| Snippet | the marker for any intermediate point of a line segment         |
| `markerEnd?`   | boolean \| MarkerShape \| Snippet | the marker for the end point of a line segment                  |
| `marker?`      | boolean \| MarkerShape \| Snippet | shorthand for setting the marker on all points                  |
| `markerScale?` | ConstantAccessor&lt;number&gt;    | scale factor for marker size, relative to the line stroke width |

### ConstantAccessor

a value that is either a constant or a function that computes a per-datum value

```ts
export type ConstantAccessor<
    K,
    T = Record<string | symbol, RawValue>
> = K | ((d: T, index: number) => K) | null | undefined;
```

### TransformArg

the input argument to a data transform: data array plus channel mappings and mark props

```ts
export type TransformArg<T> = Channels<T> &
    BaseMarkProps<T> & {
        data: T[];
    };
```

### MapArg

the input argument to a map transform: data array plus channel mappings

```ts
export type MapArg<T> = Channels<T> & {
    data: T[];
};
```

### TransformArgsRow

transform input for raw data rows (before recordization)

```ts
export type TransformArgsRow<T extends RawValue | object> =
    Partial<Channels<T>> & {
        data: T[];
    };
```

### TransformArgsRecord

transform input for data records (after recordization)

```ts
export type TransformArgsRecord<T extends object> = Partial<
    Channels<T>
> & {
    data: T[];
};
```

### TransformReturn

the return type of a transform, ensuring data is always present

```ts
export type TransformReturn<
    C extends TransformArg<T>,
    T
> = C & Required<Pick<Channels<T>, 'data'>>;
```

### AutoMarginStores

writable stores used by marks to contribute to automatic margin computation

| Prop               | Type                                      | Description                                 |
| ------------------ | ----------------------------------------- | ------------------------------------------- |
| `autoMarginTop`    | Writable&lt;Map&lt;string, number&gt;&gt; | per-mark contributions to the top margin    |
| `autoMarginLeft`   | Writable&lt;Map&lt;string, number&gt;&gt; | per-mark contributions to the left margin   |
| `autoMarginRight`  | Writable&lt;Map&lt;string, number&gt;&gt; | per-mark contributions to the right margin  |
| `autoMarginBottom` | Writable&lt;Map&lt;string, number&gt;&gt; | per-mark contributions to the bottom margin |

### UsedScales

a record indicating which scaled channels are actively used by a mark

```ts
export type UsedScales = Record<ScaledChannelName, boolean>;
```
