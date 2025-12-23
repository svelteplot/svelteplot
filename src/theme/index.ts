import type { ResolvedTheme, ThemeVitePlugins } from '@sveltepress/vite';
// import type { DefaultThemeOptions, ThemeDefault } from './theme-default';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { SERVICE_WORKER_PATH } from './constants.js';
import admonitions from './markdown/admonitions.js';
import anchors from './markdown/anchors.js';
import codeImport from './markdown/code-import.js';
import highlighter, { initHighlighter } from './markdown/highlighter.js';
import installPkg from './markdown/install-pkg.js';
import links from './markdown/links.js';
import liveCode from './markdown/live-code.js';
import mathml from './markdown/mathml.js';
import remarkMath from 'remark-math';
import createPreCorePlugins from './vite-plugins/create-pre-core-plugins.js';

export { SERVICE_WORKER_PATH } from './constants.js';

const VIRTUAL_PWA = 'virtual:pwa-info';
const VIRTUAL_PWA_SVELTE_REGISTER = 'virtual:pwa-register/svelte';

type HighlighterOptions = {
    languages?: unknown[];
    themeDark?: string;
    themeLight?: string;
    twoslash?: boolean | Record<string, unknown>;
};

type ThemeOptions = {
    pwa?: Parameters<typeof SvelteKitPWA>[0];
    i18n?: { footnoteLabel?: string; expansionTitle?: string };
    highlighter?: HighlighterOptions;
} & Record<string, unknown>;

export const themeOptionsRef: {
    value?: ThemeOptions;
} = {
    value: undefined
};

const defaultTheme = (options: ThemeOptions = {}): ResolvedTheme => {
    themeOptionsRef.value = options;
    const vitePlugins = (async (corePlugin) => {
        const plugins = [...(await createPreCorePlugins(options)), corePlugin];
        if (options?.pwa) {
            plugins.push(
                SvelteKitPWA({
                    strategies: 'injectManifest',
                    srcDir: SERVICE_WORKER_PATH.replace(/sw\.js$/, ''),
                    filename: 'sw.js',
                    injectManifest: {
                        globDirectory: '.svelte-kit/output',
                        globPatterns: [
                            'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
                            'prerendered/**/*.html'
                        ]
                    },
                    ...options.pwa
                })
            );
        } else {
            // In case of pwa relative virtual modules are not found
            plugins.push({
                name: '@sveltepress/virtual-pwa',
                resolveId(id) {
                    if (id === VIRTUAL_PWA) return VIRTUAL_PWA;
                    if (id === VIRTUAL_PWA_SVELTE_REGISTER) return VIRTUAL_PWA_SVELTE_REGISTER;
                },
                load(id) {
                    if (id === VIRTUAL_PWA) return 'export const pwaInfo = null';
                    if (id === VIRTUAL_PWA_SVELTE_REGISTER)
                        return 'export const useRegisterSW = () => ({ needRefresh: false, updateServiceWorker: false, offlineReady: false })';
                }
            });
        }
        return plugins;
    }) as ThemeVitePlugins;
    return {
        name: 'svelteplot theme',
        globalLayout: '$theme/components/GlobalLayout.svelte',
        pageLayout: '$theme/components/PageLayout.svelte',
        vitePlugins,
        remarkPlugins: [
            remarkMath,
            mathml,
            liveCode,
            admonitions,
            links,
            anchors,
            codeImport,
            installPkg
        ],
        highlighter,
        footnoteLabel: options?.i18n?.footnoteLabel
    } satisfies ResolvedTheme;
};

export { defaultTheme, highlighter, initHighlighter };
