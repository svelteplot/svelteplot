import { csvParse, autoType } from 'd3-dsv';

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export async function loadCSV(fetch: Fetch, dataset: string): Promise<any[]> {
    const res = await fetch(`/data/${dataset}.csv`);
    const text = await res.text();
    return csvParse(text, autoType);
}

export async function loadJSON(fetch: Fetch, dataset: string): Promise<any> {
    const res = await fetch(`/data/${dataset}.json`);
    return await res.json();
}

/**
 * helper function used in the SveltePlot docs to load example datasets
 */
export async function loadDatasets(ids: string[], fetch: Fetch): Promise<{ [key: string]: any[] }> {
    return Object.fromEntries(
        (await Promise.all(ids.map((id) => loadCSV(fetch, id)))).map((data, i) => [ids[i], data])
    );
}
