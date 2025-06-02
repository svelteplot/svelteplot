import { loadDatasets, loadJSON } from '$lib/helpers/data.js';
import type { PageServerLoad } from '../$types';

export const ssr = true;

export const load: PageServerLoad = async ({ fetch }) => {
    return {
        data: {
            world: await loadJSON(fetch, 'countries-110m'),
            us: await loadJSON(fetch, 'us-counties-10m'),
            ...(await loadDatasets(
                [
                    'aapl',
                    'alphabet',
                    'beagle',
                    'bls',
                    'co2',
                    'crimea',
                    'driving',
                    'languages',
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
