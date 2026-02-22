<script module>
    export const title = 'Area with point scale';
</script>

<script lang="ts">
    import { AreaY, Plot, Line } from 'svelteplot';
    let d = [
        { key: 'A', amount: -79.0 },
        { key: 'B', amount: -198.0 },
        { key: 'C', amount: -88.0 },
        { key: 'D', amount: 279.0 }
    ];
</script>

<Plot grid>
    <Line
        class="main"
        stroke="#23dad9"
        strokeWidth={3}
        curve="linear"
        data={d}
        x="key"
        y="amount" />
    <AreaY
        class="main"
        fill="#23dad9"
        fillOpacity={0.5}
        strokeWidth={3}
        curve="linear"
        data={d}
        x="key"
        y="amount" />
</Plot>
