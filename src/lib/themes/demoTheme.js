import { get } from 'svelte/store';

export const demoTheme = {
    marks: {
        axisX: {
            textPadding: 0,
            tickSize: 0,
            labelAnchor: 'top',
            labelArrow: 'none',
            labelOffset: 0,
            lineAnchor: 'bottom'
        },

        axisY: {
            textAnchor: 'start',
            // textPadding: 0,
            tickSize: 0,
            labelAnchor: 'top',
            labelArrow: 'none',
            //  labelOffset: 0,
            lineAnchor: 'bottom',
            dy: -4,
            dx: 8
        },

        dot: {
            stroke: null,
            fill: '#007acc', //get(currentTheme).color.data.primary,
            fillOpacity: 0.7,
            strokeWidth: 2,
            r: 2
        },

        line: {
            stroke: '#007acc',
            strokeWidth: 2
        },
        ruleX: {
            stroke: '#007acc'
        },
        ruleY: {
            stroke: '#007acc'
        },

        areaY: {
            stroke: '#007acc',
            strokeWidth: 0,
            fill: '#007acc',
            fillOpacity: 0.2
        }
    }
};
