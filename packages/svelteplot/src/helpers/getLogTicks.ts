import { ticks as ticksArray } from 'd3-array';

export function getLogTicks(domain: [number, number], count = 6) {
    const inverted = domain[0] < 0 && domain[1] < 0;
    if (inverted) domain = [domain[0] * -1, domain[1] * -1];
    const reversed = domain[1] < domain[0];
    if (reversed) domain = domain.slice(0).reverse() as [number, number];
    if (domain[0] < 0 || domain[1] < 0) return [];
    if (domain[0] === 0) return ticksArray(domain[0], domain[1], count - 2);
    let mult = 1; //Math.pow(10, Math.floor(Math.log10(Math.abs(domain[1] - domain[0]))) - 1);
    count += 2;
    let candidates = getTickCandidates(domain, mult);
    if (candidates[0].num > count) {
        // too many ticks
        while (candidates[0].num > count) {
            mult *= 10;
            candidates = getTickCandidates(domain, mult);
        }
    } else if (candidates[candidates.length - 1].num < count) {
        // not enough ticks, let's fallback to linear ticks
        const ticksList = ticksArray(domain[0], domain[1], count - 2);
        if (reversed) ticksList.reverse();
        return ticksList;
    }
    count -= 2;
    const ticksList = candidates
        .map((d) => ({
            ...d,
            ticks: d.ticks.filter((t) => t >= domain[0] && t <= domain[1])
        }))
        .map((d) => ({ ...d, diff: Math.abs(d.ticks.length - count) }))
        .sort((a, b) => a.diff - b.diff)[0].ticks;
    if (reversed) ticksList.reverse();
    if (inverted) return ticksList.map((t) => t * -1);
    return ticksList;
}

const logSeries = [[10], [5, 4, 5], [3, 10 / 3], [2, 2.5, 2], [1.5, 2, 5 / 3, 2]];

function getTickCandidates(domain: [number, number], mult = 1) {
    return logSeries.map((factors) => {
        let i = Math.pow(10, Math.floor(Math.log10(domain[0])));
        let f = 0;
        const ticks = [i];
        while (i < domain[1] && ticks.length < 50) {
            i *= factors[f] * mult;
            ticks.push(i);
            f = (f + 1) % factors.length;
        }
        return { ticks, num: ticks.length };
    });
}
