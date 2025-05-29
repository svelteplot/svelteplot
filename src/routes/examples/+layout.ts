import { loadDatasets, loadJSON } from '$lib/helpers/data.js';
import type { PageLoad } from './$types.js';

export const ssr = true;

export const load: PageLoad = async ({ fetch }) => {
    return {
        data: {
            world: await loadJSON(fetch, 'countries-110m'),
            us: await loadJSON(fetch, 'us-counties-10m'),
            ...(await loadDatasets(
                [
                    'aapl',
                    'beagle',
                    'bls',
                    'co2',
                    'crimea',
                    'driving',
                    'penguins',
                    'riaa',
                    'stateage',
                    'tdf',
                    'rightwing',
                    'stocks',
                    'unemployment',
                    'sftemp'
                ],
                fetch
            ))
        }
    };
};
