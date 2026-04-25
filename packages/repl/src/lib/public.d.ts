import type { OutputChunk, RollupError } from '@rollup/browser';
import type { CompileError } from 'svelte/compiler';

export interface BundleResult {
	uid: number;
	error: (RollupError & CompileError) | null;
	client: OutputChunk | null;
	server: OutputChunk | null;
	css: string | null;
	imports: string[];
}

export * from './index';
