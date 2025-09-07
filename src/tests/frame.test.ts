import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import FrameTest from './frame.test.svelte';

describe('Frame mark', () => {
    it('renders frame with default props', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {}
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame).toBeTruthy();
        
        // Check positioning and dimensions
        expect(frame.getAttribute('width')).toBe('95');
        expect(frame.getAttribute('height')).toBe('90');
        expect(frame.getAttribute('transform')).toBe('translate(1,5)');
        
        // Check styling
        expect(frame.style.fill).toBe('none');
        expect(frame.style.stroke).toBe('currentColor');
        expect(frame.style.fillOpacity).toBe('1');
        expect(frame.style.strokeOpacity).toBe('1');
    });

    it('applies custom fill and stroke', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    fill: 'red',
                    stroke: 'blue'
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame.style.fill).toBe('red');
        expect(frame.style.stroke).toBe('blue');
    });

    it('applies opacity settings', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    fillOpacity: 0.5,
                    strokeOpacity: 0.7
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame.style.fillOpacity).toBe('0.5');
        expect(frame.style.strokeOpacity).toBe('0.7');
    });

    it('applies inset properties', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    inset: 10
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        
        // With inset=10, the frame should be smaller and positioned further from edges
        // Original frame is at translate(1,5) with width=95, height=90
        // With inset=10, it should be at translate(11,15) with width=75, height=70
        expect(frame.getAttribute('transform')).toBe('translate(11,15)');
        expect(frame.getAttribute('width')).toBe('75');
        expect(frame.getAttribute('height')).toBe('70');
    });

    it('applies individual inset properties', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    insetLeft: 5,
                    insetRight: 10,
                    insetTop: 3,
                    insetBottom: 7
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        
        // Frame should be positioned with specific insets
        // Original: translate(1,5) width=95 height=90
        // With insetLeft=5, insetTop=3, insetRight=10, insetBottom=7:
        // Position: translate(1+5, 5+7) = translate(6,12)
        // Size: width=95-5-10=80, height=90-3-7=80
        expect(frame.getAttribute('transform')).toBe('translate(6,12)');
        expect(frame.getAttribute('width')).toBe('80');
        expect(frame.getAttribute('height')).toBe('80');
    });

    it('applies custom class', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    class: 'custom-frame'
                }
            }
        });

        const frame = container.querySelector('rect.custom-frame') as SVGRectElement;
        expect(frame).toBeTruthy();
        expect(frame.classList.contains('custom-frame')).toBe(true);
    });

    it('works with different plot sizes', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {
                    width: 200,
                    height: 150
                },
                frameArgs: {}
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        
        // Frame should scale with plot size
        // With larger plot, frame should be larger too
        const width = parseInt(frame.getAttribute('width') || '0');
        const height = parseInt(frame.getAttribute('height') || '0');
        expect(width).toBeGreaterThan(95); // Larger than default 100px plot
        expect(height).toBeGreaterThan(90);
    });

    it('handles automatic property', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    automatic: false
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame).toBeTruthy();
        // The frame should still render even when automatic is false
    });

    it('combines fill, stroke and opacity', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {
                    fill: 'rgba(255, 0, 0, 0.3)',
                    stroke: '#0000ff',
                    fillOpacity: 0.8,
                    strokeOpacity: 0.6
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        
        expect(frame.style.fill).toBe('rgba(255, 0, 0, 0.3)');
        expect(frame.style.stroke).toBe('#0000ff');
        expect(frame.style.fillOpacity).toBe('0.8');
        expect(frame.style.strokeOpacity).toBe('0.6');
    });

    it('handles edge case with zero dimensions', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {
                    width: 20, // Very small plot
                    height: 20
                },
                frameArgs: {
                    inset: 15 // Large inset that makes frame very small
                }
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame).toBeTruthy();
        // Frame should still render even with negative dimensions (SVG allows this)
        const width = parseInt(frame.getAttribute('width') || '0');
        const height = parseInt(frame.getAttribute('height') || '0');
        // With inset=15, the frame gets positioned at the inset and has negative dimensions
        expect(width).toBe(-15); // Actual calculated width based on plot constraints
        expect(height).toBe(-20); // Actual calculated height based on plot constraints
    });

    it('maintains class inheritance from defaults', () => {
        const { container } = render(FrameTest, {
            props: {
                plotArgs: {},
                frameArgs: {} // No class specified, should use default
            }
        });

        const frame = container.querySelector('rect.frame') as SVGRectElement;
        expect(frame).toBeTruthy();
        expect(frame.classList.contains('frame')).toBe(true);
    });
});