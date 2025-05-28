<!-- @component
    Geo mark with Sphere geometry object  -->

<script module lang="ts">
    import { type BaseMarkProps } from '$lib/types.js';
    export type SphereMarkProps = BaseMarkProps;
</script>

<script lang="ts">
    import Geo from './Geo.svelte';

    let { ...args }: SphereMarkProps = $props();
</script>

<Geo data={[{ type: 'Sphere' }]} {...args} geoType="sphere" />
