<script lang="ts">
    import type { Snippet } from 'svelte';
    let {
        length = 1,
        children,
        class: className = null,
        ...groupProps
    }: {
        children: Snippet;
        length?: number;
        class?: string | null;
        [key: string]: unknown;
    } = $props();
</script>

{#if length > 1 || className}
    <g class={className} {...groupProps}>
        {@render children()}
    </g>
{:else}
    {@render children()}
{/if}
