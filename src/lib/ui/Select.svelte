<script lang="ts">
    let {
        label = '',
        value = $bindable(),
        options,
        format = (d) => d
    }: {
        label?: string;
        value: string | number | undefined;
        options: any[];
        format?: (d: any) => string;
    } = $props();
</script>

<label
    >{label || ''}
    <select bind:value>
        {#each options as p (p)}
            <option value={p}>{format(p)}</option>
        {/each}
    </select></label>

<style>
    label {
        margin-right: 1em;
    }
</style>
