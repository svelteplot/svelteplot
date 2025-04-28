import { sveltepress } from '@sveltepress/vite';
import { defaultTheme } from '@sveltepress/theme-default';
import { defineConfig } from 'vitest/config';
import sidebar from './config/sidebar.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import path from 'path';

export default defineConfig({
    resolve: {
        ...(process.env.VITEST
            ? {
                  conditions: ['browser']
              }
            : undefined),
        alias: {
            svelteplot: path.resolve(__dirname, './src/lib/index.js')
        }
    },
    plugins: [
        sveltepress({
            theme: defaultTheme({
                logo: '/favicon.png',
                github: 'https://github.com/gka/svelteplot',
                discord: 'https://discord.gg/BJ5CJgDqWV',
                themeColor: {
                    light: '#ffffff',
                    dark: '#18181b',
                    primary: '#ed277c',
                    gradient: {
                        start: '#ed277c',
                        end: '#bf1e2d'
                    }
                },
                highlighter: {
                    themeLight: 'github-light',
                    themeDark: 'github-dark',
                    twoslash: false
                },
                navbar: [
                    //     {
                    //         title: 'Home',
                    //         to: '/'
                    //     },
                    //     {
                    //         title: 'Guide',
                    //         to: '/introduction'
                    //     }
                ],
                sidebar,
                preBuildIconifyIcons: {
                    carbon: ['ruler-alt', 'roadmap'],
                    ri: ['svelte-line', 'ruler-line'],
                    nonicons: ['typescript-16'],
                    emojione: ['artist-palette'],
                    'vscode-icons': [
                        'file-type-svelte',
                        'arrow-both',
                        'file-type-markdown',
                        'file-type-vite'
                    ]
                }
            }),

            siteConfig: {
                title: 'SveltePlot',
                description: 'The best visualizations are built with Svelte.'
            }

            // addInspect: true
        })
    ],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom'
    },

    css: {
        preprocessorOptions: {
            scss: {
                // additionalData: '@use "src/variables.scss" as *;'
            }
        }
    }
});
