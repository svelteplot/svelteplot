<script module>
    export const title = 'Log regression';
</script>

<script lang="ts">
    import { Plot, Dot, RegressionY } from 'svelteplot';
    import { page } from '$app/state';

    let { cars } = $derived(page.data.data);
</script>

<Plot grid x={{ type: 'log' }} y={{ type: 'log' }}>
    <Dot
        data={cars}
        y="weight (lb)"
        x="power (hp)"
        symbol="plus"
        opacity={0.6} />
    <RegressionY
        data={cars}
        type="pow"
        confidence={0.95}
        stroke="var(--svp-red)"
        x="power (hp)"
        y="weight (lb)" />
</Plot>
