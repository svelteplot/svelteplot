import { csvParse, autoType } from 'd3-dsv';

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export async function loadCSV(fetch: Fetch, url: string): Promise<any[]> {
    const res = await fetch(url);
    const text = await res.text();
    return csvParse(text, autoType);
}

export async function loadJSON(fetch: Fetch, url: string): Promise<any> {
    const res = await fetch(url);
    return await res.json();
}
