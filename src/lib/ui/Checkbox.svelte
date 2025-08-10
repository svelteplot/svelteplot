<script>
    let { label, value = $bindable(), ...restProps } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<label class="checkbox"
    ><input type="checkbox" bind:checked={value} {...restProps} /> {@html label}</label>

<style>
    label.checkbox + :global(label.checkbox) {
        margin-left: 0.7em;
    }
</style>
