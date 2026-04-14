import { loadJSON } from '$lib/helpers/data.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ fetch }) => {
    return {
        data: {
            graph: await loadJSON(fetch, 'miserables')
        }
    };
};
