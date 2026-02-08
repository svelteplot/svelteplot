import * as ts from 'typescript';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKS_DIR = path.resolve('src/lib/marks');
const MARKS_DOCS_DIR = path.resolve('src/routes/marks');
const MARKS_OUT_DIR = path.resolve('src/routes/api/marks');
const PLOT_OUT_DIR = path.resolve('src/routes/api/plot');
const TRANSFORMS_OUT_DIR = path.resolve('src/routes/api/transforms');
const TRANSFORMS_DIR = path.resolve('src/lib/transforms');

const EXPANDED_TYPE_NAMES = new Set(['StackOptions', 'DodgeXOptions', 'DodgeYOptions']);

const printer = ts.createPrinter({ removeComments: true });

function escapeForSvelte(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/([{}])/g, "{'$1'}"); // HTML escape doesn't work well for { and }
}

function escapeTableCell(text) {
    return escapeForSvelte(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function slugify(text) {
    return text
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/gi, '')
        .replace(/^-+|-+$/g, '');
}

function getNodeText(node, sourceFile) {
    return node ? node.getText(sourceFile) : '';
}

function getTypeText(node, sourceFile) {
    if (!node) return 'unknown';
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile).trim();
}

function getJsDocSummary(node) {
    if (!node.jsDoc?.length) return '';
    const parts = node.jsDoc
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

function getPropertyName(member, sourceFile) {
    if (!member.name) return null;
    return ts.isIdentifier(member.name) ? member.name.text : getNodeText(member.name, sourceFile);
}

function getPropertyMeta(member, sourceFile) {
    if (!ts.isPropertySignature(member) || !member.name) return null;
    const name = getPropertyName(member, sourceFile);
    if (!name) return null;
    let typeText = getTypeText(member.type, sourceFile);
    typeText = typeText.replace(/\s+/g, ' ').trim();
    typeText = typeText.replace(/^\|\s*/, '');
    const jsdoc = getJsDocSummary(member);
    return {
        name,
        optional: Boolean(member.questionToken),
        rawType: typeText,
        description: jsdoc || ''
    };
}

function formatMemberRow(member, sourceFile) {
    const meta = getPropertyMeta(member, sourceFile);
    if (!meta) return null;
    return {
        prop: `\`${escapeTableCell(`${meta.name}${meta.optional ? '?' : ''}`)}\``,
        rawType: meta.rawType,
        description: escapeTableCell(meta.description)
    };
}

function formatTypeCellWithBase(rawType, typeLinks, basePath) {
    let typeCell = escapeTableCell(rawType);
    if (typeLinks?.size) {
        for (const linkName of typeLinks) {
            const link = `[${linkName}](${basePath}#${slugify(linkName)})`;
            typeCell = typeCell.replace(new RegExp(`\\b${linkName}\\b`, 'g'), link);
        }
    }
    return typeCell;
}

function formatTypeCell(rawType, typeLinks) {
    return formatTypeCellWithBase(rawType, typeLinks, '/api/marks');
}

async function extractComponentComment(content) {
    const match = content.match(/<!--\s*@component([\s\S]*?)-->/);
    if (!match) return '';
    return match[1]
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
}

async function extractScript(content) {
    const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    return match ? match[1] : null;
}

async function extractModuleScript(content) {
    const match = content.match(/<script[^>]*module[^>]*>([\s\S]*?)<\/script>/);
    return match ? match[1] : null;
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

function getExportedTypeAliases(sourceFile) {
    const result = new Map();
    sourceFile.forEachChild((node) => {
        if (!ts.isTypeAliasDeclaration(node)) return;
        if (!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return;
        result.set(node.name.text, node);
    });
    return result;
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
    const componentProps = /ComponentProps<\s*typeof\s+(\w+)\s*>/g;
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

async function parseSource(filePath) {
    const contents = await readFile(filePath, 'utf8');
    return ts.createSourceFile(filePath, contents, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
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
            componentComment: await extractComponentComment(svelteContents)
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
    const typeAlias =
        findTypeAlias(sourceFile, `${markNameFromFile}MarkProps`) ||
        findTypeAlias(sourceFile, 'MarkProps');

    if (!iface && !typeAlias) return null;
    const declaration = iface || typeAlias;

    return {
        name: markNameFromFile,
        slug,
        propsPath: path.join(MARKS_DIR, markFile),
        interfaceName: declaration.name.text,
        isSvelte: true,
        scriptSource: sourceFile,
        rawScript: script,
        componentComment: await extractComponentComment(contents)
    };
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

function findTypeAlias(sourceFile, name) {
    let found = null;
    sourceFile.forEachChild((node) => {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === name) {
            found = node;
        }
    });
    return found;
}

function getLocalTypeDeclarations(sourceFile) {
    const interfaces = new Map();
    const aliases = new Map();
    sourceFile.forEachChild((node) => {
        if (ts.isInterfaceDeclaration(node)) {
            interfaces.set(node.name.text, node);
        } else if (ts.isTypeAliasDeclaration(node)) {
            aliases.set(node.name.text, node);
        }
    });
    return { interfaces, aliases };
}

function normalizeTypeNames(typeNames) {
    let names = Array.from(typeNames)
        .map((name) => name.trim())
        .filter(Boolean);
    if (names.length > 1) {
        names = names.filter((name) => name !== 'never');
    }
    if (names.includes('true') && names.includes('false')) {
        names = names.filter((name) => name !== 'true' && name !== 'false');
        names.push('boolean');
    }
    if (!names.length) return ['unknown'];
    return names;
}

function clonePropEntry(entry) {
    return {
        name: entry.name,
        optional: entry.optional,
        rawTypes: new Set(entry.rawTypes),
        description: entry.description || ''
    };
}

function mergePropMapsIntersection(maps) {
    const merged = new Map();
    for (const map of maps) {
        for (const [name, entry] of map) {
            const current = merged.get(name);
            if (!current) {
                merged.set(name, clonePropEntry(entry));
                continue;
            }
            current.optional = current.optional && entry.optional;
            for (const rawType of entry.rawTypes) current.rawTypes.add(rawType);
            if (!current.description && entry.description) current.description = entry.description;
        }
    }
    return merged;
}

function mergePropMapsUnion(maps) {
    if (!maps.length) return new Map();
    const allNames = new Set(maps.flatMap((map) => Array.from(map.keys())));
    const merged = new Map();
    for (const name of allNames) {
        const entries = maps.map((map) => map.get(name)).filter(Boolean);
        if (!entries.length) continue;
        const rawTypes = new Set(entries.flatMap((entry) => Array.from(entry.rawTypes)));
        const optional =
            entries.length < maps.length || entries.some((entry) => Boolean(entry.optional));
        const description = entries.find((entry) => entry.description)?.description || '';
        merged.set(name, {
            name,
            optional,
            rawTypes,
            description
        });
    }
    return merged;
}

function applyOptionalToMap(map, optional = true) {
    const cloned = new Map();
    for (const [name, entry] of map) {
        cloned.set(name, {
            ...clonePropEntry(entry),
            optional
        });
    }
    return cloned;
}

function getPropertyMapFromMembers(members, sourceFile) {
    const out = new Map();
    for (const member of members) {
        const meta = getPropertyMeta(member, sourceFile);
        if (!meta) continue;
        out.set(meta.name, {
            name: meta.name,
            optional: meta.optional,
            rawTypes: new Set([meta.rawType || 'unknown']),
            description: meta.description || ''
        });
    }
    return out;
}

function getPropertyMapFromTypeNode(typeNode, sourceFile, declarations, seen = new Set()) {
    if (!typeNode) return new Map();

    if (ts.isParenthesizedTypeNode(typeNode)) {
        return getPropertyMapFromTypeNode(typeNode.type, sourceFile, declarations, seen);
    }

    if (ts.isTypeLiteralNode(typeNode)) {
        return getPropertyMapFromMembers(typeNode.members, sourceFile);
    }

    if (ts.isUnionTypeNode(typeNode)) {
        const maps = typeNode.types.map((t) =>
            getPropertyMapFromTypeNode(t, sourceFile, declarations, seen)
        );
        return mergePropMapsUnion(maps);
    }

    if (ts.isIntersectionTypeNode(typeNode)) {
        const maps = typeNode.types.map((t) =>
            getPropertyMapFromTypeNode(t, sourceFile, declarations, seen)
        );
        return mergePropMapsIntersection(maps);
    }

    if (ts.isTypeReferenceNode(typeNode)) {
        const typeName = getNodeText(typeNode.typeName, sourceFile);
        if (typeName === 'Partial' && typeNode.typeArguments?.[0]) {
            const partialMap = getPropertyMapFromTypeNode(
                typeNode.typeArguments[0],
                sourceFile,
                declarations,
                seen
            );
            return applyOptionalToMap(partialMap, true);
        }

        const localInterface = declarations.interfaces.get(typeName);
        if (localInterface) {
            return getPropertyMapFromMembers(localInterface.members, sourceFile);
        }

        const localAlias = declarations.aliases.get(typeName);
        if (localAlias && !seen.has(typeName)) {
            const nextSeen = new Set(seen);
            nextSeen.add(typeName);
            return getPropertyMapFromTypeNode(localAlias.type, sourceFile, declarations, nextSeen);
        }
    }

    return new Map();
}

function formatPropertyMapRows(propertyMap) {
    return Array.from(propertyMap.values()).map((entry) => {
        const typeParts = normalizeTypeNames(entry.rawTypes);
        return {
            prop: `\`${escapeTableCell(`${entry.name}${entry.optional ? '?' : ''}`)}\``,
            rawType: typeParts.join(' | '),
            description: escapeTableCell(entry.description || '')
        };
    });
}

function getTypeAliasRows(typeAlias, sourceFile, declarations) {
    const propertyMap = getPropertyMapFromTypeNode(typeAlias.type, sourceFile, declarations);
    return formatPropertyMapRows(propertyMap);
}

function collectTypeReferencesFromNode(typeNode, sourceFile, declarations, refs, seen = new Set()) {
    if (!typeNode) return;

    if (ts.isParenthesizedTypeNode(typeNode)) {
        collectTypeReferencesFromNode(typeNode.type, sourceFile, declarations, refs, seen);
        return;
    }

    if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
        for (const nested of typeNode.types) {
            collectTypeReferencesFromNode(nested, sourceFile, declarations, refs, seen);
        }
        return;
    }

    if (ts.isTypeReferenceNode(typeNode)) {
        const typeName = getNodeText(typeNode.typeName, sourceFile);

        if (typeName === 'Partial' && typeNode.typeArguments?.[0]) {
            collectTypeReferencesFromNode(
                typeNode.typeArguments[0],
                sourceFile,
                declarations,
                refs,
                seen
            );
            return;
        }

        const localInterface = declarations.interfaces.get(typeName);
        if (localInterface) {
            for (const inherited of getInterfaceExtends(localInterface, sourceFile)) {
                refs.add(inherited);
            }
            if (localInterface.heritageClauses) {
                for (const clause of localInterface.heritageClauses) {
                    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
                    for (const inheritedType of clause.types) {
                        collectTypeReferencesFromNode(
                            inheritedType,
                            sourceFile,
                            declarations,
                            refs,
                            seen
                        );
                    }
                }
            }
            return;
        }

        const localAlias = declarations.aliases.get(typeName);
        if (localAlias && !seen.has(typeName)) {
            const nextSeen = new Set(seen);
            nextSeen.add(typeName);
            collectTypeReferencesFromNode(
                localAlias.type,
                sourceFile,
                declarations,
                refs,
                nextSeen
            );
            return;
        }

        refs.add(getNodeText(typeNode, sourceFile));
    }
}

function getTypeAliasExtends(typeAlias, sourceFile, declarations) {
    const refs = new Set();
    collectTypeReferencesFromNode(typeAlias.type, sourceFile, declarations, refs);
    return Array.from(refs);
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

async function generateMarksApi() {
    const entries = await readdir(MARKS_DIR);
    const markFiles = entries.filter((entry) => entry.endsWith('.svelte')).sort();

    const marks = [];
    for (const entry of markFiles) {
        const mark = await getMarkDefinition(entry);
        if (!mark) continue;
        marks.push(mark);
    }

    const markByInterface = new Map();
    const markByName = new Map();
    for (const mark of marks) {
        markByInterface.set(mark.interfaceName, mark);
        markByName.set(mark.name, mark);
    }

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

    const markSections = [];
    const typeLinks = new Set();
    const markRows = [];

    for (const mark of marks) {
        const sourceFile = mark.isSvelte ? mark.scriptSource : await parseSource(mark.propsPath);
        const localDeclarations = getLocalTypeDeclarations(sourceFile);
        const iface =
            findInterface(sourceFile, mark.interfaceName) ||
            findInterface(sourceFile, `${mark.name}MarkProps`) ||
            findInterface(sourceFile, 'MarkProps');
        const typeAlias =
            findTypeAlias(sourceFile, mark.interfaceName) ||
            findTypeAlias(sourceFile, `${mark.name}MarkProps`) ||
            findTypeAlias(sourceFile, 'MarkProps');

        const rows = iface
            ? iface.members.map((member) => formatMemberRow(member, sourceFile)).filter(Boolean)
            : typeAlias
              ? getTypeAliasRows(typeAlias, sourceFile, localDeclarations)
              : [];

        const extendsList = iface
            ? getInterfaceExtends(iface, sourceFile)
            : typeAlias
              ? getTypeAliasExtends(typeAlias, sourceFile, localDeclarations)
              : [];
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
    const marksInlineToc = marks.length
        ? marks.map((mark) => `[${mark.name}](/api/marks#${slugify(mark.name)})`).join(', ')
        : '';

    const body = [
        '---',
        'title: Marks API reference',
        '---',
        '',
        marksInlineToc
            ? `<div class="inline-toc">\n\nJump to mark: ${marksInlineToc}\n\n</div>`
            : null,
        marksInlineToc ? '' : null,
        [markSections.join('\n\n'), inheritedSection, typeSection].filter(Boolean).join('\n\n')
    ]
        .filter((line) => line != null)
        .join('\n');

    await mkdir(MARKS_OUT_DIR, { recursive: true });
    await writeFile(path.join(MARKS_OUT_DIR, '+page.md'), body, 'utf8');
}

async function generatePlotApi() {
    const plotSource = await parseSource(path.resolve('src/lib/types/plot.ts'));
    const scaleSource = await parseSource(path.resolve('src/lib/types/scale.ts'));
    const typeSources = [plotSource, scaleSource];
    const plotComponent = await readFile(path.resolve('src/lib/Plot.svelte'), 'utf8');
    const plotComment = await extractComponentComment(plotComponent);

    let plotAlias = null;
    plotSource.forEachChild((node) => {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === 'PlotOptions') {
            plotAlias = node;
        }
    });
    if (!plotAlias) {
        throw new Error('PlotOptions type alias not found.');
    }

    const typeAliasMap = new Map();
    const stringUnionMap = new Map();
    for (const source of typeSources) {
        for (const [name, node] of getTypeAliasMap(source)) {
            typeAliasMap.set(name, node);
        }
        for (const [name, values] of getStringUnionMap(source)) {
            stringUnionMap.set(name, values);
        }
    }

    const typeLinks = new Set();
    const seen = new Set();
    const queue = [];
    const optionMembers = getObjectTypeMembers(plotAlias.type);
    for (const member of optionMembers) {
        const refs = getReferencedTypeNames(member.type, plotSource);
        for (const ref of refs) {
            if (typeAliasMap.has(ref) && !seen.has(ref)) {
                queue.push(ref);
                seen.add(ref);
            }
        }
    }
    while (queue.length) {
        const current = queue.shift();
        typeLinks.add(current);
        const node = typeAliasMap.get(current);
        if (!node) continue;
        const refs = getReferencedTypeNames(node.type, node.getSourceFile());
        for (const ref of refs) {
            if (typeAliasMap.has(ref) && !seen.has(ref)) {
                queue.push(ref);
                seen.add(ref);
            }
        }
    }

    const rows = optionMembers
        .map((member) => formatMemberRow(member, plotSource))
        .filter(Boolean)
        .map((row) => ({
            prop: row.prop,
            type: formatTypeCellWithBase(row.rawType, typeLinks, '/api/plot'),
            description: row.description
        }));

    const typeSections = [];
    for (const typeName of typeLinks) {
        const node = typeAliasMap.get(typeName);
        const values = stringUnionMap.get(typeName);
        const section = formatTypeDetails(typeName, values, node);
        if (section) typeSections.push(section);
    }

    const body = [
        '---',
        'title: Plot API reference',
        '---',
        '',
        plotComment,
        plotComment ? '' : null,
        createTable(rows),
        typeSections.length ? '' : null,
        typeSections.length ? '## Type details' : null,
        typeSections.length ? '' : null,
        ...typeSections
    ]
        .filter((line) => line != null)
        .join('\n');

    await mkdir(PLOT_OUT_DIR, { recursive: true });
    await writeFile(path.join(PLOT_OUT_DIR, '+page.md'), body, 'utf8');
}

function formatFunctionSignature(fn, sourceFile) {
    const name = fn.name?.text || 'anonymous';
    const typeParams = fn.typeParameters?.length
        ? `<${fn.typeParameters.map((p) => p.getText(sourceFile)).join(', ')}>`
        : '';
    const params = fn.parameters.map((param) => {
        const paramName = param.name.getText(sourceFile);
        const optional = param.questionToken ? '?' : '';
        const paramType = param.type ? getTypeText(param.type, sourceFile) : 'unknown';
        return `${paramName}${optional}: ${paramType}`;
    });
    const returnType = fn.type ? getTypeText(fn.type, sourceFile) : 'void';
    return `${name}${typeParams}(${params.join(', ')}): ${returnType}`;
}

function formatTypeDetails(typeName, values, typeNode) {
    const description = typeNode ? getJsDocSummary(typeNode) : '';
    const header = [`### ${typeName}`];
    if (description) {
        header.push('', description);
    }
    if (typeNode && ts.isTypeAliasDeclaration(typeNode)) {
        const members = getObjectTypeMembers(typeNode.type);
        if (members.length) {
            const rows = members
                .map((member) => formatMemberRow(member, typeNode.getSourceFile()))
                .filter(Boolean)
                .map((row) => ({
                    prop: row.prop,
                    type: escapeTableCell(row.rawType),
                    description: row.description
                }));
            return [...header, '', createTable(rows)].join('\n');
        }
    }
    if (values?.length) {
        const bullets = values.map((value) => `- \`${escapeForSvelte(value)}\``);
        return [...header, '', ...bullets].join('\n');
    }
    if (typeNode) {
        const typeDef = printer
            .printNode(ts.EmitHint.Unspecified, typeNode, typeNode.getSourceFile())
            .trim();
        return [...header, '', '```ts', typeDef, '```'].join('\n');
    }
    return '';
}

function renderTypeDetailsBlock(typeName, detail) {
    if (!detail) return '';
    return formatTypeDetails(typeName, detail.values, detail.node);
}

function getReferencedTypeNames(node, sourceFile) {
    const names = new Set();
    function visit(child) {
        if (ts.isTypeReferenceNode(child)) {
            const name = child.typeName.getText(sourceFile);
            if (!['Partial', 'Record', 'Array', 'ReadonlyArray'].includes(name)) {
                names.add(name);
            }
        }
        ts.forEachChild(child, visit);
    }
    if (node) visit(node);
    return names;
}

function getOptionTypeNames(node, sourceFile) {
    const names = new Set();
    function visit(child) {
        if (ts.isTypeReferenceNode(child)) {
            const name = child.typeName.getText(sourceFile);
            if (name.endsWith('Options')) names.add(name);
        }
        ts.forEachChild(child, visit);
    }
    if (node) visit(node);
    return [...names];
}

async function generateTransformsApi() {
    const indexSource = await parseSource(path.resolve(TRANSFORMS_DIR, 'index.ts'));
    const exportEntries = [];

    indexSource.forEachChild((node) => {
        if (!ts.isExportDeclaration(node) || !node.moduleSpecifier) return;
        if (!node.exportClause || !ts.isNamedExports(node.exportClause)) return;
        const modulePath = node.moduleSpecifier.text.replace(/\.js$/, '.ts');
        for (const spec of node.exportClause.elements) {
            exportEntries.push({
                name: spec.name.text,
                modulePath
            });
        }
    });

    const sections = [];
    const sectionNames = [];
    const typeSections = [];
    const typeDetails = new Map();
    const explainedTypes = new Set();

    const transformFiles = new Set(exportEntries.map((e) => e.modulePath));
    for (const file of transformFiles) {
        const sourceFile = await parseSource(path.resolve(TRANSFORMS_DIR, file));
        const typeAliasMap = getExportedTypeAliases(sourceFile);
        const stringUnionMap = getStringUnionMap(sourceFile);
        for (const [name, node] of typeAliasMap) {
            const values = stringUnionMap.get(name);
            typeDetails.set(name, { values, node });
        }
    }

    const reduceSource = await parseSource(path.resolve('src/lib/helpers/reduce.ts'));
    const reduceStringUnionMap = getStringUnionMap(reduceSource);
    const reduceAliasMap = getExportedTypeAliases(reduceSource);
    for (const [name, node] of reduceAliasMap) {
        const values = reduceStringUnionMap.get(name);
        typeDetails.set(name, { values, node });
    }

    const typesSource = await parseSource(path.resolve('src/lib/types/index.ts'));
    const typesStringUnionMap = getStringUnionMap(typesSource);
    const typesAliasMap = getExportedTypeAliases(typesSource);
    for (const [name, node] of typesAliasMap) {
        const values = typesStringUnionMap.get(name);
        typeDetails.set(name, { values, node });
    }

    function resolveTypeDetail(typeName, sourceFile, localStringUnionMap) {
        let detail = typeDetails.get(typeName);
        if (!detail) {
            const localAlias = findTypeAlias(sourceFile, typeName);
            if (localAlias) {
                detail = {
                    values: localStringUnionMap.get(typeName),
                    node: localAlias
                };
                typeDetails.set(typeName, detail);
            }
        }
        return detail;
    }

    function expandTypeRecursive(typeName, sourceFile, localStringUnionMap) {
        const detail = resolveTypeDetail(typeName, sourceFile, localStringUnionMap);
        if (!detail) return '';
        if (explainedTypes.has(typeName)) {
            return `Options: [${typeName}](/api/transforms#${slugify(typeName)})`;
        }

        explainedTypes.add(typeName);
        const mainBlock = renderTypeDetailsBlock(typeName, detail);
        const referenced = getReferencedTypeNames(detail.node.type, detail.node.getSourceFile());
        const extraBlocks = [];
        const usedLinks = [];

        for (const refName of referenced) {
            const refDetail = resolveTypeDetail(refName, sourceFile, localStringUnionMap);
            if (!refDetail) continue;
            if (explainedTypes.has(refName)) {
                usedLinks.push(`[${refName}](/api/transforms#${slugify(refName)})`);
                continue;
            }
            const expanded = expandTypeRecursive(refName, sourceFile, localStringUnionMap);
            if (expanded) extraBlocks.push(expanded);
        }

        const usesLine = usedLinks.length ? `Uses: ${usedLinks.join(', ')}` : '';
        return [mainBlock, usesLine, ...extraBlocks].filter(Boolean).join('\n\n');
    }

    for (const entry of exportEntries) {
        const sourceFile = await parseSource(path.resolve(TRANSFORMS_DIR, entry.modulePath));
        const localStringUnionMap = getStringUnionMap(sourceFile);
        let fn = null;
        sourceFile.forEachChild((node) => {
            if (ts.isFunctionDeclaration(node) && node.name?.text === entry.name) {
                fn = node;
            }
        });
        if (!fn) continue;

        const description = getJsDocSummary(fn);
        const signature = formatFunctionSignature(fn, sourceFile);
        const optionTypes = [
            ...new Set(
                fn.parameters.flatMap((param) => {
                    if (!param.type) return [];
                    return getOptionTypeNames(param.type, sourceFile);
                })
            )
        ];

        const inlineOptionDetails = optionTypes
            .map((typeName) => expandTypeRecursive(typeName, sourceFile, localStringUnionMap))
            .filter(Boolean)
            .join('\n\n');

        sections.push(
            [
                `## ${entry.name}`,
                '',
                description,
                description ? '' : null,
                '```ts',
                signature,
                '```',
                inlineOptionDetails,
                inlineOptionDetails ? '' : null
            ]
                .filter((line) => line != null)
                .join('\n')
        );
        sectionNames.push(entry.name);
    }

    for (const [typeName, detail] of typeDetails) {
        if (explainedTypes.has(typeName)) continue;
        const section = formatTypeDetails(typeName, detail.values, detail.node);
        if (section) typeSections.push(section);
    }

    const transformsInlineToc = sectionNames.length
        ? sectionNames.map((name) => `[${name}](/api/transforms#${slugify(name)})`).join(', ')
        : '';

    const body = [
        '---',
        'title: Transforms API reference',
        '---',
        '',
        transformsInlineToc
            ? `<div class="inline-toc">\n\nJump to transforms: ${transformsInlineToc}\n\n</div>`
            : null,
        transformsInlineToc ? '' : null,
        ...sections,
        typeSections.length ? '' : null,
        typeSections.length ? '## Type details' : null,
        typeSections.length ? '' : null,
        ...typeSections
    ]
        .filter((line) => line != null)
        .join('\n');

    await mkdir(TRANSFORMS_OUT_DIR, { recursive: true });
    await writeFile(path.join(TRANSFORMS_OUT_DIR, '+page.md'), body, 'utf8');
}

const args = new Set(process.argv.slice(2));
const runAll = args.size === 0;
const runMarks = runAll || args.has('--marks');
const runPlot = runAll || args.has('--plot');
const runTransforms = runAll || args.has('--transforms');

if (runMarks) {
    await generateMarksApi();
}
if (runPlot) {
    await generatePlotApi();
}
if (runTransforms) {
    await generateTransformsApi();
}
