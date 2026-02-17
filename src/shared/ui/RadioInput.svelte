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

    const randomId = (Math.random() * 1e7).toString(32);
</script>

<div style="display:inline-block">
    {#if label}
        <label for={randomId}>{label}:</label>
    {/if}
    {#each options as p (p)}
        <label>
            <input type="radio" id={randomId} bind:group={value} value={p} />
            {format(p)}
        </label>
    {/each}
</div>
