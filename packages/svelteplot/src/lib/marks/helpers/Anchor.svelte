<script lang="ts" generics="Datum extends Record<string, any>">
    import { resolveProp } from '../../helpers/resolve.js';
    import type { ConstantAccessor } from 'svelteplot/types';

    interface AnchorProps {
        datum?: Datum;
        options?: {
            /**
             * The URL or URL fragment the hyperlink points to.
             */
            href?: ConstantAccessor<string, Datum>;
            /**
             * Where to display the linked URL, e.g. _self, _blank
             */
            target?: ConstantAccessor<string, Datum>;
            /**
             * The relationship of the target object to the link object.
             */
            rel?: ConstantAccessor<string, Datum>;
            /**
             * A MIME type for the linked URL.
             */
            type?: ConstantAccessor<string, Datum>;
            /**
             * Instructs browsers to download a URL instead of navigating to it, so the user will be prompted to save it as a local file.
             */
            download?: ConstantAccessor<string, Datum>;
            [key: string]: any;
        };
        children?: () => any;
    }

    let { datum = {} as Datum, options = {}, children }: AnchorProps = $props();

    const href = $derived(resolveProp(options.href, datum, null));
    const target = $derived(resolveProp(options.target, datum, null));
    const rel = $derived(resolveProp(options.rel, datum, null));
    const type = $derived(resolveProp(options.type, datum, null));
    const download = $derived(resolveProp(options.download, datum, null));

    // filter data attributes from options
    const dataAttributes = $derived(
        Object.fromEntries(
            Object.entries(options).filter(([key]) => key.startsWith('data-sveltekit-'))
        )
    );
</script>

{#if href}
    <!-- we can't use <a> directly here because Svelte confuses it with the 
 HTMLAElement which breaks the rendering -->
    <svelte:element
        this={'a'}
        {href}
        {target}
        {rel}
        {type}
        {download}
        {...dataAttributes}
        aria-label="link"
        xmlns="http://www.w3.org/2000/svg">
        {@render children?.()}
    </svelte:element>
{:else}
    {@render children?.()}
{/if}
