<script module>
    export const title = 'Violin plot';
    export const data = {
        iris: '/data/iris.csv'
    };
    export const description =
        'Violin plot of the Sepal Length variable from the classic <a href="https://en.wikipedia.org/wiki/Iris_flower_data_set">Iris flower dataset</a>, showing the distribution of Sepal Length for each species along with median and interquartile range.';
    export const transforms = ['density'];
</script>

<script lang="ts">
    import {
        Plot,
        densityY,
        TickY,
        RuleX,
        AreaX,
        groupZ
    } from 'svelteplot';
    import type { IrisRow } from '../types';

    let { iris }: { iris: IrisRow[] } = $props();
</script>

<Plot
    inset={10}
    x={{ axis: false, type: 'linear' }}
    y={{ label: 'Sepal length' }}
    grid
    frame>
    <AreaX
        {...densityY(
            {
                data: iris,
                y: 'Sepal.Length',
                fx: 'Species'
            },
            {}
        )}
        stack={{ offset: 'center' }}
        fillOpacity={0.5}
        stroke="currentColor" />
    <TickY
        {...groupZ(
            {
                data: iris,
                fx: 'Species',
                y: 'Sepal.Length'
            },
            { y: 'median' }
        )}
        tickLength={20}
        x={0}
        stroke="currentColor"
        strokeWidth={2} />
    <RuleX
        x={0}
        {...groupZ(
            {
                data: iris,
                fx: 'Species',
                y1: 'Sepal.Length',
                y2: 'Sepal.Length'
            },
            { y1: 'p25', y2: 'p75' }
        )}
        stroke="currentColor"
        strokeWidth={2} />
</Plot>
