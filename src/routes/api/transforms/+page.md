---
title: Transforms API reference
---

## bin

for binning in x and y dimension simultaneously

```ts
bin<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinOptions): TransformArg<T, DataRecord>
```
Options: [BinOptions](/api/transforms#BinOptions)

## binX

Bins on x. Also groups on y and the first channel of z, fill, or stroke, if any.

```ts
binX<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinXOptions): TransformArg<T, DataRecord>
```
Options: [BinXOptions](/api/transforms#BinXOptions)

## binY

Bins on y. Also groups on y and the first channel of z, fill, or stroke, if any.

```ts
binY<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: BinYOptions): TransformArg<T, DataRecord>
```
Options: [BinYOptions](/api/transforms#BinYOptions)

## bollingerX


```ts
bollingerX<T>(args: TransformArg<T>, options: BollingerOptions): TransformArg<T>
```
Options: [BollingerOptions](/api/transforms#BollingerOptions)

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
Options: [MapOptions](/api/transforms#MapOptions)

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
Options: [GroupXOptions](/api/transforms#GroupXOptions)

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
Options: [GroupYOptions](/api/transforms#GroupYOptions)

## groupZ

groups the dataset by the z channel and optionally reduces the group items
to output channels x, x1, x2, y, y1, y2, fill, stroke, r, opacity, fillOpacity,
or strokeOpacity

```ts
groupZ(input: TransformArg<T, DataRecord>, options: GroupZOptions): void
```
Options: [GroupZOptions](/api/transforms#GroupZOptions)

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
Options: [JitterOptions](/api/transforms#JitterOptions)

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
Options: [RenameChannelsOptions](/api/transforms#RenameChannelsOptions)

## replaceChannels


```ts
replaceChannels<T>({ data, ...channels }: TransformArg<T, DataRecord>, options: ReplaceChannelsOptions): TransformArg<T, DataRecord>
```
Options: [ReplaceChannelsOptions](/api/transforms#ReplaceChannelsOptions)

## select


```ts
select({ data, ...channels }: TransformArg<DataRecord>, options: SelectOptions): void
```
Options: [SelectOptions](/api/transforms#SelectOptions)

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
Options: [WindowOptions](/api/transforms#WindowOptions)

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

```ts
export type BollingerOptions = {
    n?: number;
    k?: number;
};
```
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