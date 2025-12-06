<script module>
    export const title = 'Simple trail';
    export const fullCode = true;
    export const description =
        'A simple trail mark showing how to draw paths following data points.';
</script>

<script lang="ts">
    import { autoType, csvParse } from 'd3-dsv';
    import { Plot, Trail } from 'svelteplot';

    const data = csvParse(
        `x,y,z,r
10,10,0,0
20,30,0,1
40,20,0,2
50,40,0,3
20,90,1,0
30,86,1,1
40,70,1,2
60,60,1,3
90,90,2,0
80,70,2,1
70,80,2,2`,
        autoType
    );
</script>

<Plot grid>
    <Trail {data} x="x" y="y" r="r" fill="z" />
</Plot>
