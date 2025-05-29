<script lang="ts">
    import '../../../app.scss';
</script>

<div class="theme-default--page-layout">
    <div class="content">
        <slot />
    </div>
</div>

<style>
    .content {
        margin-left: auto;
        margin-right: auto;

        :global {
            a {
                transition: color 0.2s ease-out;
            }
            a:hover {
                color: var(--svp-accent);
            }
        }
    }
</style>
