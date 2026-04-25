import { CompletionContext, snippetCompletion } from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';
import type { File } from './types';

export interface Test {
	(node: SyntaxNode, context: CompletionContext, selected: File): boolean;
}

export type { File, SyntaxNode };
