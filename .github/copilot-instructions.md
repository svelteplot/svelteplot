# GitHub Copilot Instructions for SveltePlot

This document provides comprehensive guidance for GitHub Copilot and other AI assistants working on the SveltePlot project.

## Project Overview

SveltePlot is a visualization framework based on the [layered grammar of graphics](https://vita.had.co.nz/papers/layered-grammar.html) philosophy, heavily inspired by [Observable Plot](https://github.com/observablehq/plot). It's built with Svelte/SvelteKit and TypeScript, providing a declarative approach to data visualization.

**Key Principles:**

- Layered grammar of graphics for composable visualizations
- Declarative syntax with reactive Svelte components
- Type-safe development with comprehensive TypeScript coverage
- Performance-optimized with minimal DOM manipulation
- Extensible architecture for custom marks and transforms

## Technology Stack

### Core Dependencies

- **Svelte 5.x**: Component framework with modern reactivity
- **TypeScript**: Type safety and developer experience
- **D3.js ecosystem**: Data manipulation and mathematical utilities
    - `d3-array`, `d3-scale`, `d3-shape`, `d3-color`, `d3-interpolate`, etc.
- **Vite**: Build tool and development server
- **Vitest**: Unit testing framework
- **SvelteKit**: Application framework for routing and SSR (for docs)

### Development Tools

- **ESLint**: Code linting with Svelte-specific rules
- **Prettier**: Code formatting with Svelte plugin
- **PNPM**: Package manager (preferred over npm/yarn)
- **Puppeteer**: Screenshot generation for examples

## Project Structure

```
src/
├── lib/                    # Main library code (exported package)
│   ├── Plot.svelte        # Main Plot component (public API)
│   ├── core/              # Core plotting functionality
│   │   ├── Plot.svelte    # Core plot implementation
│   │   ├── scales/        # Scale definitions and utilities
│   │   └── layout/        # Layout and coordinate systems
│   ├── marks/             # Visualization marks (shapes/elements)
│   │   ├── index.ts       # Mark exports
│   │   ├── Dot.svelte     # Scatter plot points
│   │   ├── Line.svelte    # Line charts
│   │   ├── Bar.svelte     # Bar charts (X and Y variants)
│   │   ├── Area.svelte    # Area charts
│   │   ├── Arrow.svelte   # Vector fields
│   │   ├── Grid.svelte    # Grid lines
│   │   └── Axis.svelte    # Coordinate axes
│   ├── transforms/        # Data transformation utilities
│   │   ├── index.ts       # Transform exports
│   │   ├── bin.ts         # Histogram binning
│   │   ├── group.ts       # Data grouping
│   │   ├── filter.ts      # Data filtering
│   │   └── regression.ts  # Statistical models
│   ├── types/             # TypeScript type definitions
│   ├── helpers/           # Utility functions
│   └── constants.ts       # Global constants
├── routes/                # Documentation and examples
│   ├── examples/          # Interactive examples
│   ├── features/          # Feature documentation
│   └── getting-started/   # Tutorials
└── tests/                 # Test suites
    ├── *.test.ts          # Unit tests
    └── *.test.svelte      # Component tests
```

## Core Concepts

### Grammar of Graphics

SveltePlot follows a layered approach where visualizations are built by combining:

1. **Data**: Input datasets
2. **Scales**: Mappings from data space to visual space
3. **Marks**: Visual elements (dots, lines, bars, etc.)
4. **Transforms**: Data processing operations
5. **Guides**: Axes, legends, annotations

### Plot Component Architecture

```svelte
<Plot>
    <Dot {data} x="date" y="value" />
    <Line data={trend} x="date" y="predicted" />
    <AxisX />
    <AxisY />
</Plot>
```

### Mark Components

All marks follow consistent patterns:

- Accept `data` prop for input dataset
- Use channel props (`x`, `y`, `fill`, `stroke`, etc.) for aesthetic mappings
- Support both string accessors and function accessors
- Implement reactive updates when data changes
- Handle missing/null values gracefully

### Scale System

- Automatic scale inference from data domains
- Configurable scale types (linear, log, ordinal, time, etc.)
- Consistent API across all mark types
- Smart defaults with manual override capabilities

## Coding Patterns and Conventions

### Component Development

```svelte
<script lang="ts">
    import type { ComponentProps } from 'svelte';
    import type { Data, Channel } from '../types/index.js';

    interface Props {
        data: Data;
        x: Channel;
        y: Channel;
        // Additional mark-specific props
    }

    let { data, x, y, ...props }: Props = $props();

    // Reactive computations
    const processedData = $derived(
        data.map((d) => ({
            /* transformation logic */
        }))
    );
</script>
```

### Type Definitions

- Use generic types for flexible data handling
- Define strict interfaces for component props
- Export types from `src/lib/types/index.ts`
- Follow Observable Plot and D3 naming conventions for familiar APIs

### Data Processing

```typescript
// Use D3.js utilities for data manipulation
import { extent, max, bin } from 'd3-array';
import { scaleLinear, scaleOrdinal } from 'd3-scale';

// Prefer functional programming patterns
const processData = (data: DataRow[]) =>
    data
        .filter((d) => d.value != null)
        .map((d) => ({
            ...d,
            computed: transform(d.value)
        }));
```

### Testing Patterns

```typescript
// Component tests with Testing Library
import { render } from '@testing-library/svelte';
import Component from './Component.svelte';

test('renders correctly with data', () => {
    const { container } = render(Component, {
        props: { data: mockData }
    });
    expect(
        container.querySelector('svg')
    ).toBeInTheDocument();
});

// Unit tests for utilities
import { transform } from './utility.js';

test('transforms data correctly', () => {
    expect(transform(input)).toEqual(expectedOutput);
});
```

## Development Workflow

### Setup

```bash
pnpm install                    # Install dependencies
pnpm run lint                  # Check code quality
pnpm run test                  # Run test suite
pnpm run check                 # Type checking
pnpm run dev                   # Start development server
pnpm run build                 # Build library
```

### Adding New Marks

1. Create component in `src/lib/marks/`
2. Implement consistent prop interface
3. Add to `src/lib/marks/index.ts` exports
4. Create comprehensive tests
5. Add examples in documentation
6. Update type definitions if needed

### Adding New Transforms

1. Create function in `src/lib/transforms/`
2. Follow functional programming patterns
3. Include comprehensive JSDoc comments
4. Add unit tests with edge cases
5. Export from `src/lib/transforms/index.ts`
6. Document usage patterns

### Common Issues and Solutions

#### Performance Optimization

- Use `$derived` for reactive computations
- Avoid unnecessary DOM updates
- Use D3.js utilities for efficient data processing

#### Type Safety

- Always define interfaces for component props
- Use generic types for data flexibility
- Avoid `any` types - prefer `unknown` with type guards
- Export types from public API

#### Accessibility

- Include ARIA labels for chart elements
- Ensure keyboard navigation support
- Provide alternative text for visual elements
- Test with screen readers

## Testing Guidelines

### Test Structure

- Unit tests for utility functions
- Component tests for mark behavior
- Integration tests for complete visualizations
- Visual regression tests for examples

### Testing Utilities

```typescript
// Mock data generators
const generateTimeSeriesData = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        date: new Date(2023, 0, i + 1),
        value: Math.random() * 100
    }));

// Common test helpers
const renderPlot = (marks: any[]) =>
    render(Plot, { props: { children: marks } });
```

### Coverage Expectations

- Increase test coverage to > 90%
- Test error conditions and edge cases
- Verify reactive updates work correctly
- Test with various data types and shapes

## Documentation Standards

### Code Comments

- Use JSDoc for public APIs
- Include usage examples in comments
- Document complex algorithms and mathematical operations
- Explain performance considerations

### Examples

- Provide runnable examples for each feature
- Show both simple and complex use cases
- Include real-world datasets when possible
- Demonstrate best practices and common patterns

## Common Development Tasks

### Adding a New Chart Type

1. Analyze requirements and data structure needed
2. Design component API following existing patterns
3. Implement mark component with proper typing
4. Create comprehensive test suite
5. Add interactive examples and documentation
6. Update exports and type definitions

### Optimizing Performance

1. Profile with browser dev tools
2. Identify bottlenecks in data processing or rendering
3. Implement optimizations (memoization, batching, etc.)
4. Add performance tests to prevent regressions
5. Document performance characteristics

### Debugging Visualization Issues

1. Check data format and structure
2. Verify scale domains and ranges
3. Inspect SVG output in browser
4. Use browser dev tools for CSS/layout issues
5. Add debug logging for complex calculations

## Best Practices

### Code Quality

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Keep components focused and single-purpose
- Prefer composition over inheritance
- Write self-documenting code

### API Design

- Maintain consistency with Observable Plot where possible
- Use sensible defaults with override capabilities
- Design for extensibility without complexity
- Follow Svelte conventions and idioms
- Prioritize developer experience

### Performance

- Minimize DOM manipulations
- Use efficient D3.js utilities
- Implement proper cleanup in components
- Consider memory usage with large datasets
- Profile and measure before optimizing

This document should be updated as the project evolves to maintain accuracy and usefulness for AI assistants and developers working on SveltePlot.
