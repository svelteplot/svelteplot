import type { Plugin } from '@rollup/browser';

const plugin: Plugin = {
    name: 'csv',
    transform: (code, id) => {
        if (!id.endsWith('.csv')) return;

        return {
            code: `import { csvParse, autoType } from 'd3-dsv';\nexport default csvParse(\`${code}\`, autoType);`,
            map: null
        };
    }
};

export default plugin;
