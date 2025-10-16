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
                    'metros',
                    'mpg',
                    'languages',
                    'penguins',
                    'olympians',
                    'riaa',
                    'seattle',
                    'stateage',
                    'tdf',
                    'rightwing',
                    'sales',
                    'sales2',
                    'simpsons',
                    'stocks',
                    'unemployment',
                    'sftemp',
                    'wind'
                ],
                fetch
            ))
        }
    };
};
