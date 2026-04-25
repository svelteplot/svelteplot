import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as url from 'url';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: ['.svelte', '.md'],
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: [vitePreprocess({})],
    kit: {
        paths: {
            base: process.env.BASE_PATH || '',
            relative: false
        },
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter({
            strict: false
        }),
        alias: {
            svelteplot: path.resolve(__dirname, './packages/svelteplot/src'),
            '@sveltejs/repl/bundler': path.resolve(__dirname, './packages/repl/src/lib/Bundler.svelte.ts'),
            '@sveltejs/repl/editor': path.resolve(__dirname, './packages/repl/src/lib/Editor/Editor.svelte'),
            '@sveltejs/repl/viewer': path.resolve(__dirname, './packages/repl/src/lib/Output/Viewer.svelte'),
            '@sveltejs/repl/workspace': path.resolve(__dirname, './packages/repl/src/lib/Workspace.svelte.ts'),
            '@sveltejs/repl/console': path.resolve(__dirname, './packages/repl/src/lib/Output/console/index.ts'),
            '@sveltejs/site-kit/components': path.resolve(__dirname, './packages/repl/src/lib/site-kit/components/index.ts'),
            '@sveltejs/site-kit/codemirror': path.resolve(__dirname, './packages/repl/src/lib/site-kit/codemirror/index.js'),
            '@sveltejs/site-kit/polyfills': path.resolve(__dirname, './packages/repl/src/lib/site-kit/polyfills/index.ts'),
            $shared: path.resolve(__dirname, './src/shared')
        }
    }
};

export default config;
