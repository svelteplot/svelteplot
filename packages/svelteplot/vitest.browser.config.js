import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [svelte({ hot: false })],
    resolve: {
        conditions: ['browser'],
        alias: [
            {
                find: /^svelteplot\/(.+)$/,
                replacement: path.resolve(__dirname, './src/$1')
            },
            {
                find: 'svelteplot',
                replacement: path.resolve(__dirname, './src/index.js')
            }
        ]
    },
    test: {
        include: ['tests/**/*.browser.test.svelte.ts'],
        setupFiles: ['vitest-browser-svelte'],
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }]
        }
    }
});