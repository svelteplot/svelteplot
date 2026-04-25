import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const theme = syntaxHighlighting(
	HighlightStyle.define([
		{ tag: t.keyword, color: 'var(--shiki-token-keyword)' },
		{
			tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
			color: 'var(--shiki-color-text)'
		},
		{ tag: [t.function(t.variableName), t.labelName], color: 'var(--shiki-token-function)' },
		{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: 'var(--shiki-color-text)' },
		{ tag: [t.definition(t.name), t.separator], color: 'var(--shiki-color-text)' },
		{
			tag: [
				t.typeName,
				t.className,
				t.number,
				t.changed,
				t.annotation,
				t.modifier,
				t.self,
				t.namespace
			],
			color: 'var(--shiki-token-function)'
		},
		{
			tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
			color: 'var(--shiki-color-text)'
		},
		{ tag: [t.meta, t.comment], color: 'var(--shiki-token-comment)' },
		{ tag: t.strong, fontWeight: 'bold' },
		{ tag: t.emphasis, fontStyle: 'italic' },
		{ tag: t.strikethrough, textDecoration: 'line-through' },
		{ tag: t.link, color: 'var(--shiki-color-text)', textDecoration: 'underline' },
		{ tag: t.heading, fontWeight: 'bold', color: 'var(--sk-fg-1)' },
		{ tag: [t.atom, t.bool], color: 'var(--sk-code-atom)' },
		{ tag: [t.processingInstruction, t.string, t.inserted], color: 'var(--shiki-token-string)' },
		{ tag: t.invalid, color: '#ff008c' }
	])
);
