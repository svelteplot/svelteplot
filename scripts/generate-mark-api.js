import * as ts from 'typescript';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const options = Object.create(null);

for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !key.startsWith('--') || value == null) {
        console.error(
            'Usage: node scripts/generate-mark-api.js --name "Line" --interface LineMarkProps --props src/lib/marks/line.props.ts --out src/routes/marks/line/api\n' +
                '   or: node scripts/generate-mark-api.js --all true --index src/routes/api/marks'
        );
        process.exit(1);
    }
    options[key.slice(2)] = value;
}

const MARKS_DIR = path.resolve('src/lib/marks');
const INDEX_OUT_DIR = path.resolve(options.index || 'src/routes/api/marks');
const EXPANDED_TYPE_NAMES = new Set(['StackOptions', 'DodgeXOptions', 'DodgeYOptions']);

const runAll = options.all === 'true' || options.all === '1';

if (!runAll) {
    console.error(
        'Usage: node scripts/generate-mark-api.js --all true --index src/routes/api/marks'
    );
    process.exit(1);
}

function escapeForSvelte(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\{/g, '&amp;#123;')
        .replace(/\}/g, '&amp;#125;');
}

function escapeTableCell(text) {
    return escapeForSvelte(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function slugify(text) {
    return text
        .replace(/\s+/g, '-')
        .replace(/[^A-Za-z0-9-]+/g, '')
        .replace(/^-+|-+$/g, '');
}

function formatInlineCode(text) {
    return `\`${escapeTableCell(text)}\``;
}

const printer = ts.createPrinter({ removeComments: true });

function getNodeText(node, sourceFile) {
    return node ? node.getText(sourceFile) : '';
}

function getTypeText(node, sourceFile) {
    if (!node) return 'unknown';
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile).trim();
}

function getPropertyName(member, sourceFile) {
    if (ts.isIdentifier(member.name)) return member.name.text;
    if (ts.isStringLiteral(member.name)) return member.name.text;
    return getNodeText(member.name, sourceFile);
}

function getJsDocSummary(member) {
    if (!member.jsDoc?.length) return '';
    const parts = member.jsDoc
        .map((doc) => {
            if (typeof doc.comment === 'string') return doc.comment;
            if (Array.isArray(doc.comment)) {
                return doc.comment.map((c) => c.text ?? '').join('');
            }
            return '';
        })
        .filter(Boolean);
    return parts.join('\n').trim();
}

function getStringUnionMap(sourceFile) {
    const result = new Map();
    sourceFile.forEachChild((node) => {
        if (!ts.isTypeAliasDeclaration(node)) return;
        if (!ts.isUnionTypeNode(node.type)) return;
        const values = [];
        for (const typeNode of node.type.types) {
            if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
                values.push(typeNode.literal.text);
            } else {
                return;
            }
        }
        if (values.length) {
            result.set(node.name.text, values);
        }
    });
    return result;
}

function mergeStringUnionMaps(...maps) {
    const merged = new Map();
    for (const map of maps) {
        for (const [key, value] of map) {
            merged.set(key, value);
        }
    }
    return merged;
}

function getTypeAliasMap(sourceFile) {
    const result = new Map();
    sourceFile.forEachChild((node) => {
        if (!ts.isTypeAliasDeclaration(node)) return;
        result.set(node.name.text, node);
    });
    return result;
}

async function parseSource(filePath) {
    const contents = await readFile(filePath, 'utf8');
    return ts.createSourceFile(filePath, contents, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
}

function findInterface(sourceFile, name) {
    let found = null;
    sourceFile.forEachChild((node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
            found = node;
        }
    });
    return found;
}

function getInterfaceExtends(iface, sourceFile) {
    if (!iface?.heritageClauses) return [];
    const result = [];
    for (const clause of iface.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
        for (const type of clause.types) {
            result.push(getNodeText(type, sourceFile));
        }
    }
    return result;
}

function extractComponentPropsTargets(typeName) {
    const matches = [];
    const componentProps = /ComponentProps<\s*typeof\s+([A-Za-z0-9_]+)\s*>/g;
    let match = componentProps.exec(typeName);
    while (match) {
        matches.push(match[1]);
        match = componentProps.exec(typeName);
    }
    return matches;
}

function extractBaseTypeTargets(typeName) {
    const baseTypes = ['BaseMarkProps', 'LinkableMarkProps', 'BaseRectMarkProps', 'MarkerOptions'];
    return baseTypes.filter((baseType) => typeName.includes(baseType));
}

function findTypeAlias(sourceFile, name) {
    let found = null;
    sourceFile.forEachChild((node) => {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === name) {
            found = node;
        }
    });
    return found;
}

function getObjectTypeMembers(node) {
    if (ts.isTypeLiteralNode(node)) return node.members;
    if (ts.isTypeReferenceNode(node) && node.typeName.getText() === 'Partial') {
        const arg = node.typeArguments?.[0];
        if (arg && ts.isTypeLiteralNode(arg)) return arg.members;
    }
    return [];
}

function createTable(rows) {
    if (!rows.length) return '_No props found._';
    const lines = [
        '| Prop | Type | Description |',
        '| --- | --- | --- |',
        ...rows.map((row) => `| ${row.prop} | ${row.type} | ${row.description} |`)
    ];
    return lines.join('\n');
}

function formatMemberRow(member, sourceFile) {
    if (!ts.isPropertySignature(member) || !member.name) return null;
    const name = getPropertyName(member, sourceFile);
    let typeText = getTypeText(member.type, sourceFile);
    typeText = typeText.replace(/\s+/g, ' ').trim();
    typeText = typeText.replace(/^\|\s*/, '');
    const optional = member.questionToken ? '?' : '';
    const jsdoc = getJsDocSummary(member);
    return {
        prop: formatInlineCode(`${name}${optional}`),
        rawType: typeText,
        description: escapeTableCell(jsdoc || '')
    };
}

function formatTypeCell(rawType, typeLinks) {
    let typeCell = escapeTableCell(rawType);
    if (typeLinks?.size) {
        for (const linkName of typeLinks) {
            const link = `[${linkName}](/api/marks#${slugify(linkName)})`;
            typeCell = typeCell.replace(new RegExp(`\\b${linkName}\\b`, 'g'), link);
        }
    }
    return typeCell;
}

async function getInheritedPropsTables(typeLinks, stringUnionMap, allTypeNames) {
    const baseSource = await parseSource(path.resolve('src/lib/types/mark.ts'));
    const typesSource = await parseSource(path.resolve('src/lib/types/index.ts'));

    const baseAlias = findTypeAlias(baseSource, 'BaseMarkProps');
    const markerAlias = findTypeAlias(typesSource, 'MarkerOptions');
    const linkableAlias = findTypeAlias(baseSource, 'LinkableMarkProps');
    const rectAlias = findTypeAlias(baseSource, 'BaseRectMarkProps');

    if (!baseAlias || !markerAlias) {
        throw new Error('BaseMarkProps or MarkerOptions type alias not found.');
    }

    const collectRows = (members, sourceFile) =>
        members.map((member) => formatMemberRow(member, sourceFile)).filter(Boolean);

    const noteTypeLinks = (rows) => {
        for (const row of rows) {
            for (const typeName of allTypeNames) {
                if (new RegExp(`\\b${typeName}\\b`).test(row.rawType)) {
                    typeLinks.add(typeName);
                }
            }
        }
    };

    const baseRows = collectRows(getObjectTypeMembers(baseAlias.type), baseSource);
    const markerRows = collectRows(getObjectTypeMembers(markerAlias.type), typesSource);
    noteTypeLinks(baseRows);
    noteTypeLinks(markerRows);

    const baseMembers = baseRows.map((row) => ({
        prop: row.prop,
        type: formatTypeCell(row.rawType, typeLinks),
        description: row.description
    }));

    const markerMembers = markerRows.map((row) => ({
        prop: row.prop,
        type: formatTypeCell(row.rawType, typeLinks),
        description: row.description
    }));

    const linkableRows = linkableAlias
        ? collectRows(getObjectTypeMembers(linkableAlias.type), baseSource)
        : [];
    const rectRows = rectAlias ? collectRows(getObjectTypeMembers(rectAlias.type), baseSource) : [];
    noteTypeLinks(linkableRows);
    noteTypeLinks(rectRows);

    const linkableMembers = linkableRows.map((row) => ({
        prop: row.prop,
        type: formatTypeCell(row.rawType, typeLinks),
        description: row.description
    }));

    const rectMembers = rectRows.map((row) => ({
        prop: row.prop,
        type: formatTypeCell(row.rawType, typeLinks),
        description: row.description
    }));

    return {
        baseTable: createTable(baseMembers),
        markerTable: createTable(markerMembers),
        linkableTable: linkableMembers.length ? createTable(linkableMembers) : '',
        rectTable: rectMembers.length ? createTable(rectMembers) : ''
    };
}

async function extractScript(content) {
    const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    return match ? match[1] : null;
}

async function extractModuleScript(content) {
    const match = content.match(/<script[^>]*\bmodule\b[^>]*>([\s\S]*?)<\/script>/);
    return match ? match[1] : null;
}

function extractComponentComment(content) {
    const match = content.match(/<!--\s*@component([\s\S]*?)-->/);
    if (!match) return '';
    return match[1]
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
}

async function getMarkDefinition(markFile) {
    const markNameFromFile = path.basename(markFile, '.svelte');
    const slug = markNameFromFile.toLowerCase();
    const propsFile = path.join(MARKS_DIR, `${slug}.props.ts`);
    try {
        await stat(propsFile);
        const sveltePath = path.join(MARKS_DIR, `${markNameFromFile}.svelte`);
        const svelteContents = await readFile(sveltePath, 'utf8');
        return {
            name: markNameFromFile,
            slug,
            propsPath: propsFile,
            interfaceName: `${markNameFromFile}MarkProps`,
            isSvelte: false,
            componentComment: extractComponentComment(svelteContents)
        };
    } catch {
        // fall back to .svelte parsing
    }

    const contents = await readFile(path.join(MARKS_DIR, markFile), 'utf8');
    const script = await extractScript(contents);
    if (!script) return null;
    const sourceFile = ts.createSourceFile(
        markFile,
        script,
        ts.ScriptTarget.ES2022,
        true,
        ts.ScriptKind.TS
    );

    const iface =
        findInterface(sourceFile, `${markNameFromFile}MarkProps`) ||
        findInterface(sourceFile, 'MarkProps');

    if (!iface) return null;

    return {
        name: markNameFromFile,
        slug,
        propsPath: path.join(MARKS_DIR, markFile),
        interfaceName: iface.name.text,
        isSvelte: true,
        scriptSource: sourceFile,
        rawScript: script,
        componentComment: extractComponentComment(contents)
    };
}

async function generateIndexPage(content) {
    const title = 'Marks API reference';
    const body = ['---', `title: ${title}`, '---', '', content].join('\n');

    await mkdir(INDEX_OUT_DIR, { recursive: true });
    await writeFile(path.join(INDEX_OUT_DIR, '+page.md'), body, 'utf8');
}

async function generateAllMarks() {
    const entries = await readdir(MARKS_DIR);
    const markFiles = entries.filter((entry) => entry.endsWith('.svelte')).sort();

    const marks = [];
    for (const entry of markFiles) {
        const mark = await getMarkDefinition(entry);
        if (!mark) continue;
        marks.push(mark);
    }

    const markSections = [];
    const typeLinks = new Set();
    const typeSource = await parseSource(path.resolve('src/lib/types/index.ts'));
    const stackSource = await parseSource(path.resolve('src/lib/transforms/stack.ts'));
    const dodgeSource = await parseSource(path.resolve('src/lib/transforms/dodge.ts'));
    const markerSourceText = await readFile(
        path.resolve('src/lib/marks/helpers/Marker.svelte'),
        'utf8'
    );
    const markerModule = await extractModuleScript(markerSourceText);
    const markerModuleSource = markerModule
        ? ts.createSourceFile(
              'Marker.svelte',
              markerModule,
              ts.ScriptTarget.ES2022,
              true,
              ts.ScriptKind.TS
          )
        : null;
    const stringUnionMap = mergeStringUnionMaps(
        getStringUnionMap(typeSource),
        getStringUnionMap(stackSource),
        getStringUnionMap(dodgeSource),
        markerModuleSource ? getStringUnionMap(markerModuleSource) : new Map()
    );
    const expandedTypeDefs = new Map([
        ...getTypeAliasMap(stackSource),
        ...getTypeAliasMap(dodgeSource)
    ]);
    const allTypeNames = new Set([...stringUnionMap.keys(), ...expandedTypeDefs.keys()]);
    const markRows = [];
    const markByInterface = new Map();
    const markByName = new Map();
    for (const mark of marks) {
        markByInterface.set(mark.interfaceName, mark);
        markByName.set(mark.name, mark);
    }

    for (const mark of marks) {
        const sourceFile = mark.isSvelte ? mark.scriptSource : await parseSource(mark.propsPath);
        const iface =
            findInterface(sourceFile, mark.interfaceName) ||
            findInterface(sourceFile, `${mark.name}MarkProps`) ||
            findInterface(sourceFile, 'MarkProps');

        const rows = iface
            ? iface.members.map((member) => formatMemberRow(member, sourceFile)).filter(Boolean)
            : [];

        const extendsList = iface ? getInterfaceExtends(iface, sourceFile) : [];
        mark.extends = extendsList;

        for (const row of rows) {
            for (const typeName of allTypeNames) {
                if (new RegExp(`\\b${typeName}\\b`).test(row.rawType)) {
                    typeLinks.add(typeName);
                }
            }
        }
        markRows.push({ mark, rows });
    }

    for (const { mark, rows } of markRows) {
        const formattedRows = rows.map((row) => ({
            prop: row.prop,
            type: formatTypeCell(row.rawType, typeLinks),
            description: row.description
        }));

        const inheritedTargets = new Map();
        const inheritedBaseTypes = new Map();
        for (const typeName of mark.extends || []) {
            const byInterface = markByInterface.get(typeName);
            if (byInterface) inheritedTargets.set(byInterface.name, byInterface);
            for (const componentName of extractComponentPropsTargets(typeName)) {
                const byName = markByName.get(componentName);
                if (byName) inheritedTargets.set(byName.name, byName);
            }
            for (const baseType of extractBaseTypeTargets(typeName)) {
                inheritedBaseTypes.set(baseType, baseType);
            }
        }

        const inheritedLinks = Array.from(inheritedTargets.values()).map(
            (target) => `[${target.name}](/api/marks#${slugify(target.name)})`
        );
        const inheritedBaseLinks = Array.from(inheritedBaseTypes.keys()).map(
            (baseType) => `[${baseType}](/api/marks#${slugify(baseType)})`
        );

        const inheritedAll = [...inheritedLinks, ...inheritedBaseLinks];
        const inheritedLine = inheritedAll.length
            ? `Inherited props from ${inheritedAll.join(', ')}.`
            : 'Inherited props: see the [shared section](/api/marks#Inherited-props) below.';

        const description = mark.componentComment ? mark.componentComment : '';
        const section = [
            `## ${mark.name}`,
            '',
            description,
            description ? '' : null,
            createTable(formattedRows),
            '',
            inheritedLine
        ]
            .filter((line) => line != null)
            .join('\n');
        markSections.push(section);
    }

    const inherited = await getInheritedPropsTables(typeLinks, stringUnionMap, allTypeNames);
    const inheritedSection = [
        '## Inherited props',
        '',
        'These props are shared by marks via the base type aliases.',
        '',
        '### BaseMarkProps',
        '',
        inherited.baseTable,
        '',
        '### MarkerOptions',
        '',
        inherited.markerTable,
        inherited.linkableTable ? '' : null,
        inherited.linkableTable ? '### LinkableMarkProps' : null,
        inherited.linkableTable ? '' : null,
        inherited.linkableTable || null,
        inherited.rectTable ? '' : null,
        inherited.rectTable ? '### BaseRectMarkProps' : null,
        inherited.rectTable ? '' : null,
        inherited.rectTable || null
    ]
        .filter((line) => line != null)
        .join('\n');

    const resolvedTypeSections = [];
    for (const typeName of typeLinks) {
        const values = stringUnionMap.get(typeName);
        const expanded = EXPANDED_TYPE_NAMES.has(typeName) ? expandedTypeDefs.get(typeName) : null;
        const details = [];
        if (values?.length) {
            const bullets = values.map((value) => `- \`${escapeForSvelte(value)}\``);
            details.push(...bullets);
        }
        if (expanded) {
            const typeDef = printer
                .printNode(ts.EmitHint.Unspecified, expanded, expanded.getSourceFile())
                .trim();
            details.push('', '```ts', typeDef, '```');
        }
        if (!details.length) continue;
        resolvedTypeSections.push([`### ${typeName}`, '', ...details].join('\n'));
    }

    const typeSection = resolvedTypeSections.length
        ? ['## Type details', '', ...resolvedTypeSections].join('\n')
        : '';

    await generateIndexPage(
        [markSections.join('\n\n'), inheritedSection, typeSection].filter(Boolean).join('\n\n')
    );
}

await generateAllMarks();
