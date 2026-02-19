<script>
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    /**
     * @typedef {object} Props
     * @property {any} i Index of the feature card
     * @property {any} title Title of the feature card
     * @property {any} description Description of the feature card
     * @property {any} [link] Link to navigate to when the card is clicked
     * @property {(e: any) => any} [onkeypress] Function to call when the card is pressed
     * @property {import('./types').CustomIcon} [icon] Custom icon to display in the card
     * @property {boolean} [noRandomIcon] Disable random icon fallback
     */

    /** @type {Props} */
    const {
        onkeypress = undefined,
        i,
        title,
        description,
        link = undefined,
        icon = undefined,
        noRandomIcon = false
    } = $props();

    const external = $derived(/^https?/.test(link));

    function handleFeatureCardClick() {
        if (!link) return;
        if (external) window.open(link, '_blank');
        else goto(resolve(link));
    }
</script>

<div
    class="feature-item"
    class:clickable={link}
    onclick={handleFeatureCardClick}
    {onkeypress}
    role="link"
    tabindex="0">
    <div class="feature-title">
        {title}
    </div>
    <div class="feature-desc">
        {description}
    </div>
</div>

<style>
    .clickable {
        --at-apply: 'cursor-pointer';
    }
    .clickable:hover .feature-title {
        --at-apply: 'underline';
    }
    .feature-title {
        --at-apply: font-600 mt-0;
    }
    .feature-desc {
        --at-apply: text-slate-5 mt-3 text-[14px] line-height[18px];
    }
    .feature-item {
        --at-apply: 'bg-white dark:bg-gray-9 p-4 rounded-lg hover:shadow-md transition-shadow transition-300';
    }
</style>
