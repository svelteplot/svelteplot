import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AreaYTest from './areaY.test.svelte';

describe('AreaY mark', () => {
    it('single area y', () => {
        const { container } = render(AreaYTest, {
            props: {
                data: [
                    { x: 0, value: 0 },
                    { x: 1, value: 1 },
                    { x: 2, value: 2 }
                ],
                x: 'x',
                y: 'value'
            }
        });

        const lines = container.querySelectorAll('path.area');
        expect(lines).toHaveLength(1);
        expect(lines[0]?.getAttribute('d')).toBe('M1,95L48.5,50L96,5L96,95L48.5,95L1,95Z');

        const yLabel = container.querySelector('text.axis-y-title');
        expect(yLabel).toBeTruthy();
        expect(yLabel?.textContent).toBe('value');
    });

    it('single area y1', () => {
        const { container } = render(AreaYTest, {
            props: {
                data: [
                    { x: 0, value: 0 },
                    { x: 1, value: 1 },
                    { x: 2, value: 2 }
                ],
                x: 'x',
                y1: 'value'
            }
        });

        const lines = container.querySelectorAll('path.area');
        expect(lines).toHaveLength(1);
        expect(lines[0]?.getAttribute('d')).toBe('M1,95L48.5,95L96,95L96,5L48.5,50L1,95Z');

        const yLabel = container.querySelector('text.axis-y-title');
        expect(yLabel).toBeTruthy();
        expect(yLabel?.textContent).toBe('value');
    });
});
