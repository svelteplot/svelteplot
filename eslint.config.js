import svelte, { rules } from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        rules: {
            'no-console': ['error', { allow: ['error'] }]
        }
    },
    // Ensure TypeScript files (including names like *.svelte.ts) use the TS parser
    {
        files: ['**/*.ts', '**/*.mts', '**/*.cts']
        ,
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                sourceType: 'module'
            }
        }
    },
    ...svelte.configs.recommended,
    {
        files: ['**/*.svelte', '*.svelte'],
        rules: {
            'svelte/no-object-in-text-mustaches': 'warn',
            'svelte/no-inspect': 'error',
            'svelte/no-useless-mustaches': [
                'error',
                {
                    ignoreStringEscape: true
                }
            ]
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
            'package-lock.json'
        ]
    },
    // Treat test files named *.svelte.ts as plain TypeScript tests
    {
        files: ['**/*.svelte.ts', '*.svelte.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                sourceType: 'module'
            }
        },
        rules: {
            'svelte/*': 'off'
        }
    }
];
