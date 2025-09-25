export type DataPoint = [number, number];
export type Accessor<T> = (d: T, i?: number, data?: T[]) => number;
export type PredictFunction = (x: number) => number;
export type Domain = [number, number] | undefined;
