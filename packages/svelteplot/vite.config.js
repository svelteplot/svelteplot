import { defineConfig } from 'vitest/config';
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
                replacement: path.resolve(__dirname, './src/lib/$1')
            },
            {
                find: 'svelteplot',
                replacement: path.resolve(__dirname, './src/lib/index.js')
            }
        ]
    },
    test: {
        include: [
            'src/tests/**/*.{test,spec}.{js,ts,svelte.ts}',
            'src/lib/**/*.{test,spec}.{js,ts,svelte.ts}'
        ],
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.ts']
    }
});
