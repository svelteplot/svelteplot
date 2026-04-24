<script lang="ts">
    import { Plot, RuleX } from 'svelteplot';
    import { range } from 'd3-array';
    import { randomNormal, randomLcg } from 'd3-random';
    import Code from '../../Code.svelte';

    const seededNormal = randomNormal.source(randomLcg(0.12345));
</script>

<Plot testid="barcode">
    <RuleX data={range(500).map(seededNormal(0, 1))} strokeOpacity={0.5} />
</Plot>

<Code
    code={`<scr${'ipt>'}
    import { Plot, RuleX } from 'svelteplot';
    import { randomNormal } from 'd3-random';
    import { range } from 'd3-array';
</scr${'ipt>'}
<Plot>
    <RuleX data={range(500).map(randomNormal(0,1))} strokeOpacity={0.5} />
</Plot>`}
    repl="https://svelte-5-preview.vercel.app/#H4sIAAAAAAAAE2WPTQrCMBCFrxKyaQvVVsRNjYIXEHElWBehSSWQNGGSCqXk7iYtlIqzGebN9-ZnxK2Q3OLqOeKOKo4rfDEG59gNJhb2w6Xjoba6hyYqxDYgjDvXXe2EMhocGtFNapejey_5A3nUglYoma0mdJLjDwy0Y1pdNSgqF5rtN7P-D7_5mqIAdIgQKZZLSNwfMgpB5isYdfQ0Tu70UJbZVlGTrjenZb7LMo-K6C-mAeFNpZloBWe4ctBz__JfYqhi_yEBAAA=" />
