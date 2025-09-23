<script module>
    export const title = 'Rotated axis labels';
    export const sortKey = 30;
</script>

<script lang="ts">
    import { Plot } from 'svelteplot';
</script>

<Plot
    marginBottom={50}
    x={{
        tickRotate: 45,
        domain: 'These are some ordinal ticks on a band scale'.split(
            ' '
        )
    }} />
