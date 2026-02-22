import { csvFormat } from 'd3-dsv';

const uiComponents = Object.fromEntries(
    Object.entries(
        import.meta.glob('../../../../shared/ui/*.svelte', {
            eager: true,
            query: '?raw',
            import: 'default'
        }) as Record<string, string>
    ).map(([path, src]) => [path.split('/').at(-1), src])
);

export type REPLState = {
    name: string;
    tailwind: boolean;
    files: {
        type: 'file';
        name: string;
        basename: string;
        text: true;
        contents: string;
    }[];
};

function bytesToBase64url(bytes: Uint8Array<ArrayBuffer>) {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    const b64 = btoa(bin);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function gzipStringToBytes(text: string) {
    const cs = new CompressionStream('gzip');
    const stream = new Blob([new TextEncoder().encode(text)]).stream().pipeThrough(cs);
    const out = await new Response(stream).arrayBuffer();
    return new Uint8Array(out);
}

export async function encodePlaygroundState(state: REPLState) {
    // state is whatever the playground expects (see “reverse-engineer” tip below)
    const jsonText = JSON.stringify(state);
    const gzBytes = await gzipStringToBytes(jsonText);
    return '#' + bytesToBase64url(gzBytes);
}

function firstPositive(a: number, b: number) {
    return a > -1 ? a : b;
}

const UI_REGEX = /import \{\s*([a-z]+)(?:,\s*([a-z]+))*\s*\} from '\$shared\/ui'/i;

export function createREPLState(
    title: string,
    url: string,
    source: string,
    data: Record<string, string>,
    datasets: Record<string, object[]>
): REPLState {
    const needSharedUIs: string[] = [];

    const appCode = source
        .substring(firstPositive(source.indexOf('<script lang="ts">'), source.indexOf('<script>')))
        // add import statements for each dataset
        .replace(
            'import ',
            Object.keys(data ?? {}).length
                ? `${Object.entries(data ?? {})
                      .map(([key, url]) => `import ${key} from './${url.split('/').at(-1)}';`)
                      .join('\n   ')}\n    import `
                : 'import '
        )
        .split(';')
        // remove data type imports for now
        .filter((line) => !line.trim().startsWith('import type'))
        // remove props since we're importing data
        .filter((line) => !line.trim().includes('$props'))
        // replace shared/ui imports
        .map((line) => {
            if (line.includes('$shared/ui')) {
                const m = line.match(UI_REGEX);
                if (!m) return '';
                const modules = m?.slice(1);
                return modules
                    ?.filter((d) => d)
                    ?.map((mod) => {
                        needSharedUIs.push(mod);
                        return `\n    import ${mod} from './${mod}.svelte'`;
                    })
                    .join(';');
            }
            return line;
        })
        .join(';')
        .split('\n')
        .map((line) => {
            // convert from 4-spaces to 2-spaces
            const leadingSpaces = line?.match(/^ +/)?.[0]?.length ?? -1;
            if (leadingSpaces % 4 === 0) {
                const indent = leadingSpaces / 4;
                return `${Array.from({ length: indent }, () => '  ').join('')}${line.trim()}`;
            }
            return line;
        })
        .join('\n');
    return {
        name: title,
        tailwind: false,
        files: [
            {
                type: 'file',
                name: 'App.svelte',
                basename: 'App.svelte',
                text: true,
                contents: `<!--\n  This is a SveltePlot example created from\n  https://svelteplot.dev/examples/${url}\n-->\n${appCode}`
            },
            // add dataset files
            ...Object.entries(data ?? {}).map(([key, url]) => ({
                type: 'file',
                text: true,
                name: `${url.split('/').at(-1)}.js`,
                basename: `${url.split('/').at(-1)}.js`,
                contents: url.endsWith('.csv')
                    ? `import { csvParse, autoType } from 'd3-dsv';\n\nexport default csvParse(\`${csvFormat(datasets[key])}\`, autoType);`
                    : `export default ${JSON.stringify(datasets[key], null, 4)};`
            })),
            ...needSharedUIs.map((mod) => ({
                type: 'file',
                text: true,
                name: `${mod}.svelte`,
                basename: `${mod}.svelte`,
                contents: uiComponents[`${mod}.svelte`]
            }))
        ]
    } as REPLState;
}
