import type { PageLoad } from './$types';

type ExampleModule = {
    title?: string;
    description?: string;
    data?: Record<string, string>;
};

import { loadCSV, loadJSON } from '../../helpers';
const pages = import.meta.glob<ExampleModule>('../../**/*.svelte', {
    eager: true
});

function titleCase(s: string): string {
    return s.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

export const load: PageLoad = async ({ params, fetch }) => {
    const { group, page } = params;
    const pageMeta = { ...(pages[`../../${group}/${page}.svelte`] ?? {}) };
    const { title, description } = pageMeta;
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
        return {
            title: `${title} - ${titleCase(group)} - Examples`,
            description,
            ...data
        };
    }
    return { title: `${title} - ${titleCase(group)} - Examples`, description };
};
