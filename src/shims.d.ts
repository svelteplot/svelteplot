declare module 'virtual:sveltepress/theme-default' {
    export type NavItem = {
        title?: string;
        to?: string;
        icon?: string | boolean;
        items?: NavItem[];
        external?: boolean;
        builtInIcon?: boolean;
        [key: string]: unknown;
    };

    export type LinkItem = {
        title?: string;
        to?: string;
        text?: string;
        link?: string;
        icon?: string | boolean;
        collapsible?: boolean;
        items?: LinkItem[];
        [key: string]: unknown;
    };

    export type ThemeI18n = {
        footnoteLabel?: string;
        expansionTitle?: string;
        lastUpdateAt?: string;
        onThisPage?: string;
        previousPage?: string;
        nextPage?: string;
        suggestChangesToThisPage?: string;
        pwa?: {
            tip?: string;
            close?: string;
            reload?: string;
            appReadyToWorkOffline?: string;
            newContentAvailable?: string;
        };
    };

    export type DefaultThemeOptions = {
        sidebar?: Record<string, LinkItem[]>;
        navbar?: NavItem[];
        logo?: string;
        github?: string;
        discord?: string;
        editLink?: string;
        preBuildIconifyIcons?: Record<string, string[]>;
        highlighter?: {
            languages?: unknown[];
            themeDark?: string;
            themeLight?: string;
            twoslash?: boolean | Record<string, unknown>;
        };
        themeColor?:
            | {
                  gradient?: { start: string; end: string };
                  primary?: string;
                  hover?: string;
              }
            | {
                  light: string;
                  dark: string;
              };
        pwa?: import('@vite-pwa/sveltekit').SvelteKitPWAOptions & {
            darkManifest?: string;
        };
        i18n?: ThemeI18n;
        [key: string]: unknown;
    };

    const themeOptions: DefaultThemeOptions;
    export default themeOptions;
}

declare module 'virtual:sveltepress/site' {
    export type SiteConfig = {
        title?: string;
        description?: string;
        [key: string]: unknown;
    };

    const siteConfig: SiteConfig;
    export default siteConfig;
}

declare module 'virtual:pwa-register/svelte' {
    import type { Writable } from 'svelte/store';

    export function useRegisterSW(options?: {
        onRegistered?: () => void;
        onRegisterError?: (error: unknown) => void;
    }): {
        needRefresh: Writable<boolean>;
        offlineReady: Writable<boolean>;
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
    };
}

declare module 'virtual:pwa-info' {
    export const pwaInfo: {
        webManifest: {
            linkTag: string;
        };
    } | null;
}

declare module 'svelte/elements' {
    export interface SVGAttributes<T extends EventTarget> {
        strokelinecap?: string;
        strokelinejoin?: string;
        strokewidth?: string | number;
        strokedasharray?: string | number;
        strokedashoffset?: string | number;
        fillrule?: string;
        fillopacity?: string | number;
    }
}

declare module 'unified' {
    export type Transformer<Tree = any> = (tree: Tree, file?: any) => any;
    export type Plugin<Params extends any[] = any[], Tree = any> = (
        ...args: Params
    ) => Transformer<Tree> | void;

    const unified: () => unknown;
    export default unified;
}

declare module 'temml/dist/temml.mjs' {
    const temml: {
        renderToString: (
            value: string,
            options?: { displayMode?: boolean; throwOnError?: boolean }
        ) => string;
    };
    export default temml;
}

declare module 'svg-path-parser' {
    export function parseSVG(path: string): any;
    export function makeAbsolute(commands: any): any;
    const mod: {
        parseSVG: typeof parseSVG;
        makeAbsolute: typeof makeAbsolute;
    };
    export default mod;
}

declare module 'interval-tree-1d' {
    type Interval = [number, number, ...any[]];
    type QueryCallback = (interval: Interval) => void;
    interface IntervalTreeInstance {
        insert(interval: Interval): void;
        remove(interval: Interval): void;
        queryInterval(lo: number, hi: number, cb: QueryCallback): void;
        queryPoint(point: number, cb: QueryCallback): void;
    }
    function createIntervalTree(intervals?: Interval[]): IntervalTreeInstance;
    export default createIntervalTree;
}

declare module 'd3-time';

declare module '*.svelte' {
    import type { ComponentType } from 'svelte';
    export type MarkerShape =
        | 'dot'
        | 'circle'
        | 'circle-stroke'
        | 'arrow'
        | 'arrow-reverse'
        | 'tick'
        | 'tick-x'
        | 'tick-y';
    const component: ComponentType;
    export default component;
}
