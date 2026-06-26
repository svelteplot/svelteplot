import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ruleYPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/marks/RuleY.svelte');

describe('RuleY public type contract', () => {
    const src = readFileSync(ruleYPath, 'utf8');

    it('declares Datum extends DataRecord | RawValue', () => {
        expect(src).toMatch(/generics="Datum extends DataRecord \| RawValue/);
    });

    it('passes data to recordizeY without a DataRow cast', () => {
        expect(src).not.toMatch(/data as DataRow\[\]/);
    });
});