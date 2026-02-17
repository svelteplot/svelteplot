<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { useDark } from '$shared/ui/isDark.svelte';

    import '../app.scss';

    let { children } = $props();

    afterNavigate(() => {
        const content = document.querySelector('.content');
        if (content) {
            // headline version links
            content
                .querySelectorAll('h1 + .admonition-info, h2 + .admonition-info')
                .forEach((el) => {
                    if (el.querySelector('.admonition-content').innerText.startsWith('added in')) {
                        const version = el
                            .querySelector('.admonition-content')
                            .innerText.replace('added in ', '')
                            .trim();
                        const header = el.previousElementSibling;
                        el.remove();
                        const a = document.createElement('a');
                        a.innerHTML = `<span class="admonition-content">^${version}</span>`;
                        a.target = '_blank';
                        a.title = `Added in version ${version}`;
                        a.classList.add('version-link');
                        a.classList.add('admonition-info');
                        a.href = `https://github.com/svelteplot/svelteplot/releases/tag/v${version}`;
                        header?.appendChild(a);
                    }
                });
            // inline version links
            content.querySelectorAll('em').forEach((el) => {
                if (el.innerText.startsWith('added in')) {
                    const version = el.innerText.replace('added in ', '').trim();
                    const parent = el.parentElement;
                    el.remove();
                    const a = document.createElement('a');
                    a.innerHTML = `<span class="admonition-content">^${version}</span>`;
                    a.target = '_blank';
                    a.title = `Added in version ${version}`;
                    a.classList.add('version-link');
                    a.classList.add('admonition-info');
                    a.href = `https://github.com/svelteplot/svelteplot/releases/tag/v${version}`;
                    parent?.appendChild(a);
                }
            });
        }
    });

    const ds = useDark();

    $effect(() => {
        // watch dark class on html element
        const observer = new MutationObserver(() => {
            ds.isDark = document.documentElement.classList.contains('dark');
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        ds.isDark = document.documentElement.classList.contains('dark');
        return () => observer.disconnect();
    });
</script>

{@render children()}

<style lang="scss">
    :global(.version-link) {
        font-size: 11px;
        margin-left: 0.75em;
        text-decoration: none;
        opacity: 0.8;
        vertical-align: super;
        background-color: rgb(118 51 219 / 30%);
        color: #7633db;
        padding: 0.3rem;
        line-height: 1;
        border-radius: 0.15rem;
        display: inline-block;
        text-decoration: none !important;
        font-weight: normal;
    }
</style>
