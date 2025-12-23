import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import temml from 'temml/dist/temml.mjs';

const MATH_LANGS = new Set(['math', 'latex', 'tex']);

const mathml: Plugin = () => {
    return (tree: any) => {
        visit(tree, 'code', (node: any, index, parent: any) => {
            const lang = (node.lang || '').toLowerCase();
            if (!MATH_LANGS.has(lang) || index == null || !parent) return;
            const mathml = temml.renderToString(node.value || '', {
                displayMode: true,
                throwOnError: false
            });
            parent.children.splice(index, 1, { type: 'html', value: mathml });
        });

        visit(tree, ['math', 'inlineMath'], (node: any, index, parent: any) => {
            if (index == null || !parent) return;
            const mathml = temml.renderToString(node.value || '', {
                displayMode: node.type === 'math',
                throwOnError: false
            });
            parent.children.splice(index, 1, { type: 'html', value: mathml });
        });
    };
};

export default mathml;
