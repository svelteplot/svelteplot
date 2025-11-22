import { loadCSV, loadJSON } from '../../helpers';
const pages = import.meta.glob('../../**/*.svelte', {
    eager: true
});

export const load = async ({ params, fetch }) => {
    const { group, page } = params;
    const pageMeta = { ...pages[`../../${group}/${page}.svelte`] };
    if (pageMeta.data) {
        const data = Object.fromEntries(
            await Promise.all(
                Object.entries(pageMeta.data || {}).map(async ([key, url]) => [
                    key,
                    typeof url === 'string' && url.endsWith('.csv')
                        ? await loadCSV(fetch, url)
                        : typeof url === 'string' && url.endsWith('.json')
                          ? await loadJSON(fetch, url)
                          : url
                ])
            )
        );
        return data;
    }
    return {};
};
