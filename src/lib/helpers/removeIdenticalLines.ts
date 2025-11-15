type Tick = { text: string[] };

/**
 * Remove identical lines from a set of ticks
 */
export default function removeIdenticalLines(input: Tick[]): Tick[] {
    const uniqueTicks: Tick[] = [];
    if (!input.length) return input;
    for (let c = 0; c < input.length; c++) {
        // initialize new tick array with empty text lines
        uniqueTicks.push({
            ...input[c],
            text: []
        });
    }
    const maxLines = Math.max(...input.map((t) => t.text.length));
    for (let l = 0; l < maxLines; l++) {
        const isIdentical =
            input.length > 1 && input.every((tick) => input[0].text[l] === tick.text[l]);
        for (let c = 0; c < input.length; c++) {
            if (!isIdentical && input[c].text[l] != null)
                uniqueTicks[c].text.push(input[c].text[l]);
        }
    }
    return uniqueTicks;
}
