<script lang="ts">
    let {
        label,
        value = $bindable(),
        min = 0,
        max = 100,
        step = 1,
        type = 'range'
    }: {
        label: string;
        type?: 'range' | 'number';
        value: number;
        min?: number;
        max?: number;
        step?: number;
    } = $props();
</script>

<label>
    <span>{label}:</span>
    {#if type === 'range'}
        <input type="range" bind:value {min} {max} {step} />
        <span class="value">({value})</span>{:else}
        <input
            type="number"
            style:width={`${`${Math.max(Math.abs(min), Math.abs(max))}`.length}rem`}
            bind:value
            {min}
            {max}
            {step} />
    {/if}
</label>

<style>
    label {
        display: inline-flex;
        gap: 1ex;
        margin-right: 1em;
    }
    .value {
        opacity: 0.5;
    }
    input {
        accent-color: var(--svp-accent);
        width: 15ex;
    }
</style>
