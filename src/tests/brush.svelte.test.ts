import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import BrushTest from './brush.test.svelte';
import { tick, type ComponentProps } from 'svelte';

describe('Brush mark', () => {
    it('single brush with basic properties', async () => {
        const props: ComponentProps<typeof BrushTest> = $state({
            plotArgs: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
            brushArgs: {},
            brush: { enabled: false }
        });

        const { container } = render(BrushTest, props);

        // should render nothing
        const rect = container.querySelectorAll('rect.brush-rect');
        expect(rect.length).toBe(0);
    });

    it('brush reacts to state changes', async () => {
        const props: ComponentProps<typeof BrushTest> = $state({
            plotArgs: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
            brushArgs: {},
            brush: { enabled: false }
        });

        const { container } = render(BrushTest, props);

        // should render nothing
        const rect = container.querySelectorAll('rect.brush-rect');
        expect(rect.length).toBe(0);

        props.brush = { enabled: true, x1: 3, x2: 6, y1: 2, y2: 8 };
        await tick();

        const rect2 = container.querySelectorAll('rect.brush-rect');
        expect(rect2.length).toBe(1);
    });

    it('user drag creates brush', async () => {
        const user = userEvent.setup();

        const props: ComponentProps<typeof BrushTest> = $state({
            plotArgs: { width: 400, x: { domain: [0, 10] }, y: { domain: [0, 10] } },
            brushArgs: {},
            brush: { enabled: false }
        });

        const { container } = render(BrushTest, props);

        // Verify the brush was reset
        const resetRect = container.querySelectorAll('rect.brush-rect');
        expect(resetRect.length).toBe(0);

        // Simulate user drag from position [30,30] to [50,50]
        // First, get the frame element where we'll perform the drag
        const frame = container.querySelector('rect.frame') as HTMLElement;

        if (!frame) {
            throw new Error('Frame element not found');
        }

        // Create a mouseEvent sequence - using pointer down, move, up pattern
        await user.pointer([
            { target: frame, coords: { clientX: 40, clientY: 40 } },
            { target: frame, coords: { clientX: 40, clientY: 40 }, keys: '[MouseLeft>]' },
            { target: frame, coords: { clientX: 50, clientY: 50 } },
            { target: frame, coords: { clientX: 70, clientY: 70 } },
            { target: frame, coords: { clientX: 70, clientY: 70 }, keys: '[/MouseLeft]' }
        ]);

        await tick();

        expect(props.brush.enabled).toBe(true);

        // Verify the brush was created/updated
        const draggedRect = container.querySelectorAll('rect.brush-rect');
        expect(draggedRect.length).toBe(1);
    });
});
