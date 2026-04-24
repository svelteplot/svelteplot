import ResizeObserver from 'resize-observer-polyfill';
import MatchMediaMock from 'vitest-matchmedia-mock';
import type MatchMedia from 'vitest-matchmedia-mock';

import { afterEach, beforeAll } from 'vitest';

let matchMedia: MatchMedia = new MatchMediaMock();

beforeAll(() => {
    global.ResizeObserver = ResizeObserver;
});

afterEach(async () => {
    // Wait for Svelte's async reactive teardown (queued via microtasks)
    // to complete before jsdom destroys the window. Without this,
    // orphaned requestAnimationFrame callbacks fire on a destroyed
    // window, causing "Cannot read properties of null" errors.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    // Cancel any pending rAF callbacks. jsdom uses monotonically
    // increasing IDs from 1 and cancelAnimationFrame is a no-op
    // for non-existent IDs.
    const id = requestAnimationFrame(() => {});
    for (let i = 1; i <= id; i++) {
        cancelAnimationFrame(i);
    }

    matchMedia.clear();
});
