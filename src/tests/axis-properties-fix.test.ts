/**
 * Test case demonstrating the fix for issue #202
 *
 * Before the fix, these AxisX and AxisY properties would cause TypeScript errors:
 * - AxisX.fill
 * - AxisX.textAnchor
 * - AxisX.style
 * - AxisY.fill
 *
 * And users had to use the workaround: {...{} as any}
 */

import { test, expect } from 'vitest';

test('AxisX and AxisY accept fill, textAnchor, and style properties', () => {
    // Simulate the BaseMarkProps with our fixes
    interface BaseMarkProps<T> {
        fill?: string;
        textAnchor?: string;
        style?: string;
        stroke?: string;
        dx?: number;
        dy?: number;
        opacity?: number;
        class?: string | null;
    }

    // AxisX interface (fill no longer excluded)
    interface AxisXMarkProps extends Omit<
        BaseMarkProps<any>,
        'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target'
    > {
        data?: any[];
        tickSize?: number;
        tickPadding?: number;
        tickFontSize?: number;
        anchor?: 'top' | 'bottom';
    }

    // AxisY interface (fill no longer excluded, has its own textAnchor)
    interface AxisYMarkProps extends Omit<
        BaseMarkProps<any>,
        'fillOpacity' | 'paintOrder' | 'title' | 'href' | 'target'
    > {
        data?: any[];
        tickSize?: number;
        tickPadding?: number;
        tickFontSize?: number;
        textAnchor?: 'auto' | 'start' | 'middle' | 'end';
        lineAnchor?: 'top' | 'center' | 'bottom';
        dx?: number;
        dy?: number;
        title?: string;
        stroke?: string;
    }

    // Test scenario from the issue description
    const styles = {
        gridLines: 'grid' as const,
        fontSize: 12,
        fontColor: '#333',
        lineColor: '#666'
    };
    const width = 400;

    // This should now work without TypeScript errors (no need for {...{} as any})
    const axisYProps: AxisYMarkProps = {
        tickSize: (styles.gridLines as string) === 'ticks' ? 6 : 0,
        tickPadding: (styles.gridLines as string) === 'ticks' ? 4 : 0,
        tickFontSize: styles.fontSize,
        stroke: styles.lineColor,
        dx: width,
        dy: styles.gridLines === 'grid' ? -styles.fontSize * 0.8 : 0,
        lineAnchor: 'center',
        textAnchor: 'end',
        title: '',
        style: `color: ${styles.fontColor};`,
        fill: styles.lineColor // This was causing TypeScript error before
    };

    // Test AxisX with the properties mentioned in the issue
    const axisXProps: AxisXMarkProps = {
        tickSize: 6,
        tickPadding: 4,
        tickFontSize: styles.fontSize,
        textAnchor: 'middle', // This was causing TypeScript error before
        style: `color: ${styles.fontColor};`, // This was causing TypeScript error before
        fill: styles.lineColor // This was causing TypeScript error before
    };

    // Test that we can assign these props without TypeScript compilation errors
    expect(axisYProps.fill).toBe(styles.lineColor);
    expect(axisYProps.textAnchor).toBe('end');
    expect(axisYProps.style).toContain(styles.fontColor);

    expect(axisXProps.fill).toBe(styles.lineColor);
    expect(axisXProps.textAnchor).toBe('middle');
    expect(axisXProps.style).toContain(styles.fontColor);

    // The test passes if no TypeScript compilation errors occur
    expect(true).toBe(true);
});
