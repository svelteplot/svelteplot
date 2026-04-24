declare module 'resize-observer-polyfill' {
    const ResizeObserver: {
        new (callback: ResizeObserverCallback): ResizeObserver;
        prototype: ResizeObserver;
    };
    export default ResizeObserver;
}
