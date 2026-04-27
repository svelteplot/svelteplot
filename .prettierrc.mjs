const config = {
    useTabs: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'none',
    printWidth: 100,
    plugins: ['prettier-plugin-svelte'],
    overrides: [
        {
            files: '*.svelte',
            options: {
                parser: 'svelte',
                bracketSameLine: true,
                svelteAllowShorthand: true
            }
        },
        {
            files: '*.md',
            options: {
                tabWidth: 2,
                printWidth: 60,
                embeddedLanguageFormatting: 'off',
                bracketSameLine: true,
                svelteAllowShorthand: true
            }
        },
        {
            files: 'src/content/tutorial/**/*.svelte',
            options: {
                tabWidth: 2,
                printWidth: 40
            }
        },
        {
            files: '**/routes/examples/**/*.svelte',
            options: {
                printWidth: 60
            }
        },
        {
            files: 'src/routes/examples/**/*.svelte',
            options: {
                printWidth: 60
            }
        }
    ]
};

export default config;
