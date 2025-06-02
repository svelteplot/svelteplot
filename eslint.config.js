import svelte, { rules } from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        rules: {
            'no-console': ['error', { allow: ['error'] }]
        }
    },
    ...svelte.configs.recommended,
    {
        files: ['**/*.svelte', '*.svelte'],
        rules: {
            'svelte/no-object-in-text-mustaches': 'warn',
            'svelte/no-inspect': 'warn'
        },
        ignores: ['dist/*', '.sveltepress/*'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsParser
            }
        }
    },
    {
        ignores: [
            '.DS_Store',
            'node_modules',
            '/build',
            '/.svelte-kit',
            '/package',
            '/dist',
            '/.sveltepress',
            '.env',
            '.env.*',
            '!.env.example',
            'pnpm-lock.yaml',
            'package-lock.json',
            'yarn.lock'
        ]
    }
];
