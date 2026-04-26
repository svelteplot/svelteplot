<script lang="ts">
    import type { Snippet } from 'svelte';
    import { sidebar } from '../../theme/components/layout';
    import { onDestroy, onMount } from 'svelte';

    let { children }: { children: Snippet } = $props();

    $sidebar = false;
    onMount(() => {
        document.body.style.overflow = 'hidden';
    });
    onDestroy(() => {
        $sidebar = true;
        document.body.style.overflow = '';
    });
</script>

<div class="tutorial-shell">
    {@render children()}
</div>

<style>
    :global(main) {
        --header-height: 73px;
    }
    .tutorial-shell {
        /* sk-* CSS tokens used by the REPL components — mapped to svelteplot.dev colors */
        --sk-bg-1: #ffffff;
        --sk-bg-2: #f7f7f7;
        --sk-bg-3: #eeeeee;
        --sk-bg-4: #e0e0e0;
        --sk-fg-1: #111111;
        --sk-fg-2: #333333;
        --sk-fg-3: #555555;
        --sk-fg-4: #888888;
        --sk-fg-accent: #ed277c;
        --sk-border: #dddddd;
        --sk-border-radius: 4px;
        --sk-border-radius-inner: 2px;
        --sk-shadow: drop-shadow(2px 4px 16px rgba(0, 0, 0, 0.12));
        --sk-font-ui-small: 400 0.75rem/1 var(--font-sans, system-ui);
        --sk-font-ui-medium: 400 0.875rem/1 var(--font-sans, system-ui);
        --sk-font-mono: 400 0.85rem/1.5 var(--font-mono, monospace);
        --sk-pane-controls-height: 2.8rem;
        /* raised button tokens */
        --sk-raised-color: var(--sk-border);
        --sk-raised-width: 1px;
        --sk-raised-hover-color: var(--sk-fg-3);
        --sk-raised-active-color: var(--sk-fg-1);
        --sk-raised-active-width: 2px;
        /* CodeMirror syntax highlight colors — github-light palette */
        --shiki-color-text: #1f2328;
        --shiki-token-keyword: #cf222e;
        --shiki-token-function: #8250df;
        --shiki-token-comment: #6e7781;
        --shiki-token-string: #0a3069;
        --sk-code-atom: #0550ae;
        /* header height for viewport calculation — matches GlobalLayout's pt-[76px] sm:pt-[73px] */
        --header-height: 76px;

        display: flex;
        flex-direction: column;
        height: calc(100dvh - 76px);
        overflow: hidden;
    }

    @media (min-width: 640px) {
        .tutorial-shell {
            --header-height: 73px;
            height: calc(100dvh - var(--header-height));
        }
    }

    @media (prefers-color-scheme: dark) {
        .tutorial-shell {
            --sk-bg-1: #18181b;
            --sk-bg-2: #222226;
            --sk-bg-3: #2a2a2e;
            --sk-bg-4: #333338;
            --sk-fg-1: #f0f0f0;
            --sk-fg-2: #cccccc;
            --sk-fg-3: #aaaaaa;
            --sk-fg-4: #777777;
            --sk-border: #3a3a3e;
            /* CodeMirror syntax highlight colors — github-dark palette */
            --shiki-color-text: #e6edf3;
            --shiki-token-keyword: #ff7b72;
            --shiki-token-function: #d2a8ff;
            --shiki-token-comment: #8b949e;
            --shiki-token-string: #a5d6ff;
            --sk-code-atom: #79c0ff;
        }
    }

    /* raised button style used by REPL components */
    :global(.raised) {
        background: var(--sk-bg-1);
        border: var(--sk-raised-width) solid var(--sk-raised-color);
        border-radius: var(--sk-border-radius);
        color: var(--sk-fg-2);
        cursor: pointer;
        font: var(--sk-font-ui-small);
        padding: 0.3em 0.8em;
        line-height: 1;
    }
    :global(.raised:hover) {
        border-color: var(--sk-raised-hover-color);
    }
    :global(.raised:active) {
        border-color: var(--sk-raised-active-color);
        border-width: var(--sk-raised-active-width);
    }
    :global(.raised:disabled) {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>
