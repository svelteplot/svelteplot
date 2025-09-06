<script lang="ts">
    import '../app.scss';

    $effect(() => {
        const content = document.querySelector('.content');
        if (content) {
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
        }
    });
</script>

<slot />

<style>
    :global(.version-link) {
        font-size: 11px;
        margin-left: 0.75em;
        text-decoration: none;
        opacity: 0.8;
        vertical-align: super;
        background-color: rgb(118 51 219 / 10%);
        color: #7633db;
        padding: 0.3rem;
        line-height: 1;
        border-radius: 0.15rem;
        display: inline-block;
        text-decoration: none !important;
        font-weight: normal;
    }
</style>
