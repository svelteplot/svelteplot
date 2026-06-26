import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
// @ts-ignore - svelte-check errors on .svelte imports, tsc does not
import LineDotSortTest from './lineDotSort.test.svelte';

const languages = [
    { Language: 'Zulu', speakers: 300 },
    { Language: 'Alpha', speakers: 100 },
    { Language: 'Beta', speakers: 200 }
];

/** Y-axis tick order when domain follows descending speakers (y scale reverses domain). */
const speakersDescTicks = ['Alpha', 'Beta', 'Zulu'];
/** Y-axis tick order when domain is alphabetical (y scale reverses domain). */
const alphaTicks = ['Zulu', 'Beta', 'Alpha'];

function yTickTexts(container: HTMLElement) {
    return Array.from(container.querySelectorAll('svg g.axis-y .tick text')).map(
        (t) => t.textContent
    );
}

describe('sort on second layer (issue #19)', () => {
    it('dot sort on second layer orders the shared y domain', () => {
        const { container } = render(LineDotSortTest, {
            props: {
                lineArgs: {
                    data: languages,
                    x: 'speakers',
                    y: 'Language',
                    opacity: 0.5
                },
                dotArgs: {
                    data: languages,
                    x: 'speakers',
                    y: 'Language',
                    fill: 'steelblue',
                    sort: { channel: '-x' }
                }
            }
        });

        expect(yTickTexts(container)).toEqual(speakersDescTicks);
        expect(yTickTexts(container)).not.toEqual(alphaTicks);
    });

    it('line sort on first layer still orders the shared y domain', () => {
        const { container } = render(LineDotSortTest, {
            props: {
                lineArgs: {
                    data: languages,
                    x: 'speakers',
                    y: 'Language',
                    sort: { channel: '-x' },
                    opacity: 0.5
                },
                dotArgs: {
                    data: languages,
                    x: 'speakers',
                    y: 'Language',
                    fill: 'steelblue'
                }
            }
        });

        expect(yTickTexts(container)).toEqual(speakersDescTicks);
        expect(yTickTexts(container)).not.toEqual(alphaTicks);
    });
});