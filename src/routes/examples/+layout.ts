import { loadDatasets, loadJSON } from '$lib/helpers/data.js';
import type { PageServerLoad } from '../$types';

export const ssr = true;

export const load: PageServerLoad = async ({ fetch }) => {
    return {
        data: {
            world: await loadJSON(fetch, 'countries-110m'),
            us: await loadJSON(fetch, 'us-counties-10m'),
            earthquakes: await loadJSON(fetch, 'earthquakes'),
            ...(await loadDatasets(
                [
                    'aapl',
                    'alphabet',
                    'beagle',
                    'bls',
                    'cars',
                    'co2',
                    'countries_2020',
                    'crimea',
                    'driving',
                    'election',
                    'gistemp',
                    'languages',
                    'metros',
                    'mpg',
                    'olympians',
                    'penguins',
                    'presidents2',
                    'riaa',
                    'rightwing',
                    'sales',
                    'sales2',
                    'seattle',
                    'sftemp',
                    'simpsons',
                    'stateage',
                    'stocks',
                    'trade',
                    'tdf',
                    'unemployment',
                    'wind'
                ],
                fetch
            ))
        }
    };
};
