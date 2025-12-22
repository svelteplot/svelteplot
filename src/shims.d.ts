declare module 'virtual:sveltepress/theme-default' {
    export type LinkItem = {
        text?: string;
        link?: string;
        items?: LinkItem[];
        [key: string]: unknown;
    };

    export type DefaultThemeOptions = {
        sidebar?: Record<string, LinkItem[]>;
        preBuildIconifyIcons?: Record<string, string[]>;
        highlighter?: {
            languages?: unknown[];
            themeDark?: string;
            themeLight?: string;
            twoslash?: boolean | Record<string, unknown>;
        };
        themeColor?: {
            gradient?: { start: string; end: string };
            primary?: string;
            hover?: string;
        };
        pwa?: import('@vite-pwa/sveltekit').SvelteKitPWAOptions;
        i18n?: { footnoteLabel?: string; expansionTitle?: string };
        [key: string]: unknown;
    };

    const themeOptions: DefaultThemeOptions;
    export default themeOptions;
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
