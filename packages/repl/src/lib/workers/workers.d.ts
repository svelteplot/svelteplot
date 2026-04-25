import type { CompileError, CompileOptions, CompileResult, Warning } from 'svelte/compiler';
import type { File } from '../Workspace.svelte';
import type { MessageDetails } from '$lib/types';

export type CompilerCommand =
	| {
			id: number;
			type: 'init';
			svelte_url: string;
	  }
	| {
			id: number;
			type: 'compile';
			payload: CompilerInput;
	  }
	| {
			id: number;
			type: 'migrate';
			payload: MigrateInput;
	  };

export interface CompilerInput {
	source: string;
	options: CompileOptions;
	is_entry: boolean;
	return_ast: boolean;
	svelte_url?: string;
}

export interface CompilerOutput {
	js: string;
	css: string;
	ast?: CompileResult['ast'];
	error?: CompileError;
	warnings: Warning[];
	metadata?: {
		runes: boolean;
	};
}

export interface MigrateInput {
	source: string;
}

export interface MigrateOutput {
	result: {
		code: string;
	};
	error?: string;
}

export interface BundleOptions {
	svelte_version: string;
	tailwind?: boolean;
	runes?: boolean;
	fragments?: 'html' | 'tree';
	async?: boolean;
	aliases?: Record<string, string>;
}

export type BundleMessageData = {
	uid: number;
	type: 'init' | 'bundle' | 'status' | 'error' | 'version';
	message: string;
	svelte_version: string;
	files: File[];
	options: BundleOptions;
};

declare global {
	var svelte: typeof import('svelte/compiler');
}
