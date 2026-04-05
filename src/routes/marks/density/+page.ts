import { loadCSV } from '$lib/helpers/data.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ fetch }) => {
    return {
        data: {
            penguins: await loadCSV(fetch, 'penguins'),
            iris: await loadCSV(fetch, 'iris')
        }
    };
};
