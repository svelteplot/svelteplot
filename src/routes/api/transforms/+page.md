---
title: Transforms API reference
---

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

| Prop | Type | Description |
| --- | --- | --- |
| `domain?` | [ number, number ] |  |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |  |
| `interval?` | number \| string |  |
| `cumulative?` | false \| 1 \| -1 |  |
| `reverse?` | boolean |  |

### NamedThresholdsGenerator

- `auto`
- `scott`
- `sturges`
- `freedman-diaconis`

### AdditionalOutputChannels

| Prop | Type | Description |
| --- | --- | --- |
| `fill` | ReducerOption |  |
| `stroke` | ReducerOption |  |
| `r` | ReducerOption |  |
| `opacity` | ReducerOption |  |
| `fillOpacity` | ReducerOption |  |
| `strokeOpacity` | ReducerOption |  |

### ReducerOption

```ts
type ReducerOption = ReducerName | ((group: DataRecord[]) => RawValue);
```

### ReducerName

```ts
export type ReducerName = 'count' | 'deviation' | 'difference' | 'first' | 'last' | 'max' | 'mean' | 'median' | 'min' | 'mode' | 'ratio' | 'sum' | 'variance' | ReducerPercentile;
```

## binX

Bins on x. Also groups on y and the first channel of z, fill, or stroke, if any.

```ts
binX<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinXOptions): TransformArg<T, DataRecord>
```
### BinXOptions

```ts
export type BinXOptions = BinBaseOptions & AdditionalOutputChannels & Partial<{
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
export type BinYOptions = BinBaseOptions & AdditionalOutputChannels & Partial<{
    x: ReducerOption;
    x1: ReducerOption;
    x2: ReducerOption;
}>;
```

Uses: [BinBaseOptions](/api/transforms#BinBaseOptions), [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

## bollingerX


```ts
bollingerX<T>(args: TransformArg<T>, options: BollingerOptions): TransformArg<T>
```
### BollingerOptions

| Prop | Type | Description |
| --- | --- | --- |
| `n?` | number | the window size (the window transform’s k option), an integer; defaults to 20 |
| `k?` | number | the band radius, a number representing a multiple of standard deviations; defaults to 2 |

## bollingerY


```ts
bollingerY<T>(args: TransformArg<T>, options: BollingerOptions): TransformArg<T>
```
Options: [BollingerOptions](/api/transforms#BollingerOptions)

## geoCentroid


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

## densityY

One-dimensional kernel density estimation

```ts
densityY<T>(args: TransformArg<T>, options: DensityOptions<T> & {
    channel?: 'x' | 'x1' | 'x2';
}): TransformArg<T>
```

## filter


```ts
filter<T>({ data, ...channels }: TransformArg<T>): TransformArg<T>
```

## map


```ts
map<T>(args: TransformArg<T>, options: MapOptions): void
```

## mapX


```ts
mapX<T>(args: TransformArg<T>, mapper: MapMethod): void
```

## mapY


```ts
mapY<T>(args: TransformArg<T>, mapper: MapMethod): void
```

## normalizeX


```ts
normalizeX<T>(args: TransformArg<T>, basis: NormalizeBasis): void
```

## normalizeY


```ts
normalizeY<T>(args: TransformArg<T>, basis: NormalizeBasis): void
```

## normalizeParallelX

Convenience wrapper for normalizeY for parallel coordinates.

Channels:
- x: the categorical axis (e.g., 'Measurement')
- y: the value to normalize (e.g., 'Value')
- z: the grouping variable (e.g., 'Id')

```ts
normalizeParallelX<T>(args: TransformArg<T>, basis: NormalizeBasis): void
```

## normalizeParallelY

Convenience wrapper for normalizeY for parallel coordinates.

Channels:
- x: the categorical axis (e.g., 'Measurement')
- y: the value to normalize (e.g., 'Value')
- z: the grouping variable (e.g., 'Id')

```ts
normalizeParallelY<T>(args: TransformArg<T>, basis: NormalizeBasis): void
```

## group

groups the dataset by x and y channel and optionally reduces the group items
to output channels fill, stroke, r, opacity, fillOpacity, or strokeOpacity

```ts
group({ data, ...channels }: TransformArg<T, DataRecord>, options: GroupXOptions): void
```
### GroupXOptions

```ts
type GroupXOptions = GroupBaseOptions & AdditionalOutputChannels & Partial<{
    y: ReducerOption;
    y1: ReducerOption;
    y2: ReducerOption;
    xPropName: string;
}>;
```

Uses: [AdditionalOutputChannels](/api/transforms#AdditionalOutputChannels), [ReducerOption](/api/transforms#ReducerOption)

### GroupBaseOptions

| Prop | Type | Description |
| --- | --- | --- |
| `domain?` | [ number, number ] |  |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |  |
| `interval?` | number \| string |  |
| `cumulative?` | false \| 1 \| -1 |  |
| `reverse?` | boolean |  |
| `copy?` | string[] | copy properties from the first element of each group |

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
type GroupYOptions = GroupBaseOptions & AdditionalOutputChannels & Partial<{
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


```ts
intervalX<T>(args: TransformArg<T>, { plot }: {
    plot: PlotState;
}): void
```

## intervalY


```ts
intervalY<T>(args: TransformArg<T>, { plot }: {
    plot: PlotState;
}): void
```

## jitter


```ts
jitter<T, C extends TransformArg<T>>({ data, ...channels }: C, options: Partial<Record<PositionalScale, JitterOptions>>): TransformReturn<C, T>
```

## jitterX


```ts
jitterX<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'x'>
```
### JitterOptions

```ts
type JitterOptions = {
    source?: () => number;
} & ({
    type: 'uniform';
    width?: number | string;
} | {
    type: 'normal';
    std?: number | string;
});
```

## jitterY


```ts
jitterY<T>(args: TransformArg<T>, options: JitterOptions): TransformReturn<T, 'y'>
```
Options: [JitterOptions](/api/transforms#JitterOptions)

## recordizeX


```ts
recordizeX<T>({ data, ...channels }: TransformArgsRow<DataRow>, { withIndex }: unknown): TransformArgsRecord<DataRecord>
```

## recordizeY


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
type RenameChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName>>;
```

## replaceChannels


```ts
replaceChannels<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: ReplaceChannelsOptions): TransformArg<T, DataRecord>
```
### ReplaceChannelsOptions

```ts
type ReplaceChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName[]>>;
```

## select


```ts
select({ data, ...channels }: TransformArg<DataRecord>, options: SelectOptions): void
```
### SelectOptions

```ts
type SelectOptions = 'first' | 'last' | AtLeastOne<{
    [k in ChannelName]: 'min' | 'max';
}>;
```

### AtLeastOne

```ts
type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
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


```ts
selectMaxX(args: TransformArg<DataRecord>): void
```

## selectMaxY


```ts
selectMaxY(args: TransformArg<DataRecord>): void
```

## selectMinX


```ts
selectMinX(args: TransformArg<DataRecord>): void
```

## selectMinY


```ts
selectMinY(args: TransformArg<DataRecord>): void
```

## shiftX


```ts
shiftX({ data, ...channels }: TransformArg<DataRecord>, shiftBy: string | number | RequireAtLeastOne<ShiftXOptions>): TransformArg<DataRecord>
```

## shiftY


```ts
shiftY({ data, ...channels }: TransformArg<DataRecord>, shiftBy: string | number | RequireAtLeastOne<ShiftYOptions>): TransformArg<DataRecord>
```

## sort


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


```ts
stackX<T>({ data, ...channels }: TransformArg<T>, opts: Partial<StackOptions>): TransformArg<T>
```

## stackY


```ts
stackY<T>({ data, ...channels }: TransformArg<T>, opts: Partial<StackOptions>): TransformArg<T>
```

## stackMosaicX


```ts
stackMosaicX<T>(args: unknown, opts: unknown): void
```

## stackMosaicY


```ts
stackMosaicY<T>(args: unknown, opts: unknown): void
```

## windowX


```ts
windowX(args: TransformArg<DataRecord>, options: WindowOptions): void
```
### WindowOptions

| Prop | Type | Description |
| --- | --- | --- |
| `k` | number |  |
| `interval` | string |  |
| `anchor` | 'start' \| 'middle' \| 'end' |  |
| `reduce` | ReducerName |  |
| `strict` | boolean |  |

Uses: [ReducerName](/api/transforms#ReducerName)

## windowY


```ts
windowY(args: TransformArg<DataRecord>, options: WindowOptions): void
```
Options: [WindowOptions](/api/transforms#WindowOptions)


## Type details

### BinXOptions

```ts
export type BinXOptions = BinBaseOptions & AdditionalOutputChannels & Partial<{
    y: ReducerOption;
    y1: ReducerOption;
    y2: ReducerOption;
}>;
```
### BinYOptions

```ts
export type BinYOptions = BinBaseOptions & AdditionalOutputChannels & Partial<{
    x: ReducerOption;
    x1: ReducerOption;
    x2: ReducerOption;
}>;
```
### BollingerOptions

| Prop | Type | Description |
| --- | --- | --- |
| `n?` | number | the window size (the window transform’s k option), an integer; defaults to 20 |
| `k?` | number | the band radius, a number representing a multiple of standard deviations; defaults to 2 |
### StackOrder

- `none`
- `appearance`
- `inside-out`
- `sum`
### StackOffset

- `none`
- `wiggle`
- `center`
- `normalize`
- `diverging`
### StackOptions

```ts
export type StackOptions = {
    offset: null | StackOffset;
    order: null | StackOrder;
    reverse: boolean;
} | false;
```
### ReducerPercentile

```ts
export type ReducerPercentile = (`p${Digit}${Digit}` & Record<never, never>) | 'p25' | 'p50' | 'p75';
```
### ReducerName

```ts
export type ReducerName = 'count' | 'deviation' | 'difference' | 'first' | 'last' | 'max' | 'mean' | 'median' | 'min' | 'mode' | 'ratio' | 'sum' | 'variance' | ReducerPercentile;
```
### BinOptions

```ts
type BinOptions = BinBaseOptions & AdditionalOutputChannels;
```
### BinBaseOptions

| Prop | Type | Description |
| --- | --- | --- |
| `domain?` | [ number, number ] |  |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |  |
| `interval?` | number \| string |  |
| `cumulative?` | false \| 1 \| -1 |  |
| `reverse?` | boolean |  |
### NamedThresholdsGenerator

- `auto`
- `scott`
- `sturges`
- `freedman-diaconis`
### AdditionalOutputChannels

| Prop | Type | Description |
| --- | --- | --- |
| `fill` | ReducerOption |  |
| `stroke` | ReducerOption |  |
| `r` | ReducerOption |  |
| `opacity` | ReducerOption |  |
| `fillOpacity` | ReducerOption |  |
| `strokeOpacity` | ReducerOption |  |
### ReducerOption

```ts
type ReducerOption = ReducerName | ((group: DataRecord[]) => RawValue);
```
### GroupXOptions

```ts
type GroupXOptions = GroupBaseOptions & AdditionalOutputChannels & Partial<{
    y: ReducerOption;
    y1: ReducerOption;
    y2: ReducerOption;
    xPropName: string;
}>;
```
### GroupBaseOptions

| Prop | Type | Description |
| --- | --- | --- |
| `domain?` | [ number, number ] |  |
| `thresholds?` | NamedThresholdsGenerator \| number \| number[] \| ThresholdCountGenerator |  |
| `interval?` | number \| string |  |
| `cumulative?` | false \| 1 \| -1 |  |
| `reverse?` | boolean |  |
| `copy?` | string[] | copy properties from the first element of each group |
### GroupYOptions

```ts
type GroupYOptions = GroupBaseOptions & AdditionalOutputChannels & Partial<{
    x: ReducerOption;
    x1: ReducerOption;
    x2: ReducerOption;
    yPropName: string;
}>;
```
### GroupZOptions

```ts
type GroupZOptions = GroupXOptions | GroupYOptions;
```
### JitterOptions

```ts
type JitterOptions = {
    source?: () => number;
} & ({
    type: 'uniform';
    width?: number | string;
} | {
    type: 'normal';
    std?: number | string;
});
```
### RenameChannelsOptions

```ts
type RenameChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName>>;
```
### ReplaceChannelsOptions

```ts
type ReplaceChannelsOptions = Partial<Record<ScaledChannelName, ScaledChannelName[]>>;
```
### SelectOptions

```ts
type SelectOptions = 'first' | 'last' | AtLeastOne<{
    [k in ChannelName]: 'min' | 'max';
}>;
```
### AtLeastOne

```ts
type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
```
### WindowOptions

| Prop | Type | Description |
| --- | --- | --- |
| `k` | number |  |
| `interval` | string |  |
| `anchor` | 'start' \| 'middle' \| 'end' |  |
| `reduce` | ReducerName |  |
| `strict` | boolean |  |