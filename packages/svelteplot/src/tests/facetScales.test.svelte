<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import FacetScalesChild from './facetScalesChild.test.svelte';
    let { plotArgs = {}, dotArgs = {} }: { plotArgs?: any; dotArgs?: any } = $props();
</script>

<Plot width={200} height={200} margin={0} axes={false} {...plotArgs}>
    <Dot {...dotArgs} />
    <FacetScalesChild />
</Plot>
