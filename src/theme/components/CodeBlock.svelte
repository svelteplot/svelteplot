<script>
    /**
     * @typedef {object} Props
     * @property {string} [code] - The code value
     * @property {string} [lang] - The language of the code
     */

    /** @type {Props} */
    let { code = '', lang = 'text' } = $props();

    let highlightedCode = $state('');

    async function loadShikiAndHighlight() {
        const { codeToHtml } = await import('shiki');
        highlightedCode = await codeToHtml(code, {
            lang,
            themes: {
                dark: 'github-dark',
                light: 'github-light'
            }
        });
    }

    $effect(() => {
        loadShikiAndHighlight();
    });
</script>

<div>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html highlightedCode}
</div>
