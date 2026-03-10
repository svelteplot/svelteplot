import { loadDatasets, loadJSON } from '$lib/helpers/data.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ fetch }) => {
    return {
        data: {
            volcano: await loadJSON(fetch, 'volcano'),
            ...(await loadDatasets(['ca55'], fetch))
        }
    };
};
