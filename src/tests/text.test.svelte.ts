import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import TextTest from './text.test.svelte';
import { getTranslate } from './utils';
import { tick } from 'svelte';

const testData = [
    { x: 10, y: 20, label: 'First', value: 5 },
    { x: 15, y: 25, label: 'Second', value: 10 }
];

describe('Text mark', () => {
    it('renders text with basic props', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    text: 'label'
                }
            }
        });

        const texts = container.querySelectorAll('g.text > text') as NodeListOf<SVGTextElement>;
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe('First');
        expect(texts[1].textContent).toBe('Second');

        // Check positioning
        const positions = Array.from(texts).map(getTranslate);
        expect(positions[0]).not.toStrictEqual(positions[1]);
    });

    it('renders text with constant text value', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    text: 'Constant Text'
                }
            }
        });

        const texts = container.querySelectorAll('g.text > text') as NodeListOf<SVGTextElement>;
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe('Constant Text');
        expect(texts[1].textContent).toBe('Constant Text');
    });

    it('renders text with function accessor', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    text: (d: any) => `${d.label}: ${d.value}`
                }
            }
        });

        const texts = container.querySelectorAll('g.text > text') as NodeListOf<SVGTextElement>;
        expect(texts.length).toBe(2);
        expect(texts[0].textContent).toBe('First: 5');
        expect(texts[1].textContent).toBe('Second: 10');
    });

    it('renders multiline text', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Line 1\nLine 2\nLine 3'
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();

        // For multiline text, it should contain tspan elements
        const tspans = text.querySelectorAll('tspan');
        expect(tspans.length).toBe(3);
        expect(tspans[0].textContent).toBe('Line 1');
        expect(tspans[1].textContent).toBe('Line 2');
        expect(tspans[2].textContent).toBe('Line 3');
    });

    it('applies font styling properties', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Styled Text',
                    fontSize: 16,
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
                    fill: 'red'
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text.style.fontSize).toBe('16px');
        expect(text.style.fontFamily).toBe('Arial');
        expect(text.style.fontWeight).toBe('bold');
        expect(text.style.fill).toBe('red');
    });

    it('applies text rotation', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Rotated Text',
                    rotate: 45
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        const transform = text.getAttribute('transform');
        expect(transform).toContain('rotate(45)');
    });

    it('applies custom text class', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Custom Class Text',
                    textClass: 'custom-text-class'
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text.classList).toContain('custom-text-class');
    });

    it('adds title attribute for tooltips', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Text with tooltip',
                    title: 'This is a tooltip'
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        const title = text.querySelector('title');
        expect(title).not.toBeNull();
        expect(title?.textContent).toBe('This is a tooltip');
    });

    it('applies dx and dy offsets', async () => {
        let props = $state({
            plotArgs: {},
            textArgs: {
                data: [{ x: 50, y: 50 }],
                x: 'x',
                y: 'y',
                text: 'Offset Text',
                dx: 0,
                dy: 0
            }
        });
        const { container } = render(TextTest, { props });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();

        // Simply verify that the transform attribute contains the expected translate values
        // The exact positioning depends on scaling, but dx/dy should be applied
        const transform = text.getAttribute('transform');
        // extract translate part
        const [tx1, ty1] = (transform || '')
            .match(/translate\(([^)]+)\)/)?.[1]
            .split(',')
            .map(parseFloat) || [0, 0];

        props.textArgs.dx = 10;
        props.textArgs.dy = -5;

        await tick(); // wait for Svelte reactivity

        const transform2 = text.getAttribute('transform');
        const [tx2, ty2] = (transform2 || '')
            .match(/translate\(([^)]+)\)/)?.[1]
            .split(',')
            .map(parseFloat) || [0, 0];
        expect(tx2).toBeCloseTo(tx1 + 10);
        expect(ty2).toBeCloseTo(ty1 - 5);
    });

    it('handles different line anchors', () => {
        const lineAnchors = ['top', 'middle', 'bottom'] as const;

        lineAnchors.forEach((anchor) => {
            const { container } = render(TextTest, {
                props: {
                    plotArgs: {},
                    textArgs: {
                        data: [{ x: 50, y: 50 }],
                        x: 'x',
                        y: 'y',
                        text: `${anchor} anchored text`,
                        lineAnchor: anchor
                    }
                }
            });

            const text = container.querySelector('g.text > text') as SVGTextElement;
            expect(text).not.toBeNull();

            const dominantBaseline = text.getAttribute('dominant-baseline');
            const expectedBaseline =
                anchor === 'top' ? 'hanging' : anchor === 'middle' ? 'central' : 'auto';
            expect(dominantBaseline).toBe(expectedBaseline);
        });
    });

    it('handles different frame anchors', () => {
        const frameAnchors = [
            'top-left',
            'top-right',
            'middle',
            'bottom-left',
            'bottom-right'
        ] as const;
        const positions = ['1,5', '96,5', '49,50', '1,95', '96,95'] as const;

        frameAnchors.forEach((anchor, i) => {
            const { container } = render(TextTest, {
                props: {
                    plotArgs: {},
                    textArgs: {
                        data: [{}], // No x,y specified to test frame positioning
                        text: `${anchor} anchored text`,
                        frameAnchor: anchor
                    }
                }
            });

            const text = container.querySelector('g.text > text') as SVGTextElement;
            expect(text).not.toBeNull();

            // Frame anchor affects text positioning when x,y are not specified
            const transform = text.getAttribute('transform');
            expect(transform).toContain(`translate(${positions[i]})`);
        });
    });

    it('handles data-driven styling properties', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: testData,
                    x: 'x',
                    y: 'y',
                    text: 'label',
                    fontSize: (d: any) => d.value + 10,
                    fill: (d: any) => (d.value > 7 ? 'red' : 'blue')
                }
            }
        });

        const texts = container.querySelectorAll('g.text > text') as NodeListOf<SVGTextElement>;
        expect(texts.length).toBe(2);

        // First item (value: 5) should be blue, fontSize 15
        expect(texts[0].style.fontSize).toBe('15px');
        expect(texts[0].style.fill).toBe('blue');

        // Second item (value: 10) should be red, fontSize 20
        expect(texts[1].style.fontSize).toBe('20px');
        expect(texts[1].style.fill).toBe('red');
    });

    it('handles stroke properties', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Stroked Text',
                    stroke: 'black',
                    strokeWidth: 2
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text.style.stroke).toBe('black');
        expect(text.style.strokeWidth).toBe('2px');
    });

    it('handles opacity properties', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Semi-transparent Text',
                    opacity: 0.5,
                    fillOpacity: 0.7,
                    strokeOpacity: 0.3
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();
        expect(text.style.opacity).toBe('0.5');
        expect(text.style.fillOpacity).toBe('0.7');
        expect(text.style.strokeOpacity).toBe('0.3');
    });

    it('handles empty or null text values', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [
                        { x: 10, y: 20, label: 'Valid' },
                        { x: 30, y: 40, label: '' },
                        { x: 50, y: 60, label: null }
                    ],
                    x: 'x',
                    y: 'y',
                    text: 'label'
                }
            }
        });

        const texts = container.querySelectorAll('g.text > text') as NodeListOf<SVGTextElement>;

        // Should render all text elements even with empty/null values
        expect(texts.length).toBe(3);
        expect(texts[0].textContent).toBe('Valid');
        expect(texts[1].textContent).toBe('');
        expect(texts[2].textContent).toBe('null');
    });

    it('handles lineHeight for multiline text', () => {
        const { container } = render(TextTest, {
            props: {
                plotArgs: {},
                textArgs: {
                    data: [{ x: 50, y: 50 }],
                    x: 'x',
                    y: 'y',
                    text: 'Line 1\nLine 2',
                    fontSize: 20,
                    lineHeight: 1.5
                }
            }
        });

        const text = container.querySelector('g.text > text') as SVGTextElement;
        expect(text).not.toBeNull();

        const tspans = text.querySelectorAll('tspan');
        expect(tspans.length).toBe(2);

        // Second tspan should have dy based on fontSize * lineHeight
        const secondTspan = tspans[1];
        const dy = secondTspan.getAttribute('dy');
        expect(dy).toBe('30'); // 20 * 1.5
    });
});
