import ResizeObserver from 'resize-observer-polyfill';
import MatchMediaMock from 'vitest-matchmedia-mock';
import type MatchMedia from 'vitest-matchmedia-mock';

import { afterEach, beforeAll } from 'vitest';

let matchMedia: MatchMedia = new MatchMediaMock();

beforeAll(() => {
    global.ResizeObserver = ResizeObserver;
});

afterEach(() => {
    matchMedia.clear();
});
