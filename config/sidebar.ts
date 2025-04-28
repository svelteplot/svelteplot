export default {
    '/': [
        {
            title: 'Guide',
            collapsible: false,
            items: [
                {
                    title: 'Getting started',
                    to: '/getting-started/'
                },
                {
                    title: 'Why SveltePlot?',
                    to: '/why-svelteplot/'
                }
                // {
                //     title: 'Introduction',
                //     to: '/introduction/'
                // }
            ]
        },
        {
            title: 'Features',
            collapsible: true,
            items: [
                {
                    title: 'Plot',
                    to: '/features/plot/'
                },

                {
                    title: 'Marks',
                    to: '/features/marks/'
                },
                {
                    title: 'Scales',
                    to: '/features/scales/'
                },
                {
                    title: 'Transforms',
                    to: '/features/transforms/'
                },
                {
                    title: 'Faceting',
                    to: '/features/facets/'
                }
            ]
        },
        {
            title: 'Marks',
            collapsible: true,
            items: [
                { title: 'Area', to: '/marks/area/' },
                { title: 'Arrow', to: '/marks/arrow/' },
                { title: 'Axis', to: '/marks/axis/' },
                { title: 'Bar', to: '/marks/bar/' },
                { title: 'Bollinger', to: '/marks/bollinger/' },
                { title: 'Box', to: '/marks/box/' },
                { title: 'Cell', to: '/marks/cell/' },
                { title: 'Custom', to: '/marks/custom/' },
                { title: 'Difference', to: '/marks/difference/' },
                { title: 'Dot', to: '/marks/dot/' },
                { title: 'Frame', to: '/marks/frame/' },
                { title: 'Geo', to: '/marks/geo/' },
                { title: 'Grid', to: '/marks/grid/' },
                { title: 'Line', to: '/marks/line/' },
                { title: 'Link', to: '/marks/link/' },
                { title: 'Pointer', to: '/marks/pointer/' },
                { title: 'Vector', to: '/marks/vector/' },
                { title: 'Rect', to: '/marks/rect/' },
                { title: 'Regression', to: '/marks/regression/' },
                { title: 'Rule', to: '/marks/rule/' },
                { title: 'Text', to: '/marks/text/' },
                { title: 'Tick', to: '/marks/tick/' }
            ]
        },
        {
            title: 'Transforms',
            collapsible: true,
            items: [
                { title: 'Bin', to: '/transforms/bin/' },
                { title: 'Filter', to: '/transforms/filter/' },
                { title: 'Group', to: '/transforms/group/' },
                { title: 'Interval', to: '/transforms/interval/' },
                { title: 'Map', to: '/transforms/map/' },
                { title: 'Normalize', to: '/transforms/normalize/' },
                { title: 'Select', to: '/transforms/select/' },
                { title: 'Shift', to: '/transforms/shift/' },
                { title: 'Sort', to: '/transforms/sort/' },
                { title: 'Stack', to: '/transforms/stack/' },
                { title: 'Window', to: '/transforms/window/' }
            ]
        },
        {
            title: 'Advanced use',
            collapsible: true,
            items: [
                {
                    title: 'Markers',
                    to: '/features/markers/'
                },
                {
                    title: 'Transforms',
                    to: '/features/transforms/'
                },
                {
                    title: 'Projections',
                    to: '/features/projections/'
                },
                {
                    title: 'Interactivity',
                    to: '/features/interactivity/'
                },
                {
                    title: 'Defaults',
                    to: '/features/defaults/'
                }
            ]
        }
    ]
};
