import type { ComponentProps } from 'svelte';
import RuleY from '../src/marks/RuleY.svelte';

type AssertRuleYProps<T extends ComponentProps<typeof RuleY>> = T;

// Regression guards (green on main; stay green after fix)
type _RawBaseline = AssertRuleYProps<{ data: [0, 1] }>;
type _RecordRows = AssertRuleYProps<{ data: { y: number }[]; y: 'y' }>;
type AssertTrue<T extends true> = T;
type RuleYData = NonNullable<ComponentProps<typeof RuleY>['data']>;
type _NumberArrayAssignable = [number[]] extends [RuleYData] ? true : false;
type _ExpectNumberArray = AssertTrue<_NumberArrayAssignable>;