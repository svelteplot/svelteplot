<script lang="ts">
    import type { Snippet } from 'svelte';
    import { sidebar } from '../../theme/components/layout';
    import { onDestroy } from 'svelte';

    let { children }: { children: Snippet } = $props();

    $sidebar = false;
    onDestroy(() => { $sidebar = true; });
</script>

<div class="tutorial-shell">
    {@render children()}
</div>

<style>
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

        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
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
        }
    }
</style>
