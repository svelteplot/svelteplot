<!--
  This example demonstrates that the TypeScript issue from #202 is now fixed.
  
  Before the fix, the following AxisY component would cause TypeScript errors
  and require the workaround: {...{} as any}
  
  After the fix, all properties are accepted without TypeScript errors.
-->
<script lang="ts">
  import { Plot, AxisY, AxisX, Dot } from 'svelteplot';
  
  // Sample data
  const data = [
    { x: 1, y: 10 },
    { x: 2, y: 15 }, 
    { x: 3, y: 12 },
    { x: 4, y: 18 },
    { x: 5, y: 14 }
  ];
  
  // Styles object like in the issue
  const styles = {
    gridLines: 'grid' as const,
    fontSize: 12,
    fontColor: '#333',
    lineColor: '#666'
  };
  
  const width = 400;
</script>

<div>
  <h2>Fixed: AxisX and AxisY TypeScript Properties</h2>
  
  <p>This example shows that the following properties now work without TypeScript errors:</p>
  <ul>
    <li><code>fill</code> - for both AxisX and AxisY</li>
    <li><code>textAnchor</code> - for both AxisX and AxisY</li>
    <li><code>style</code> - for both AxisX and AxisY</li>
  </ul>
  
  <!-- This is the exact pattern from the issue that now works -->
  <Plot width={400} height={300} marginLeft={60} marginBottom={50}>
    <Dot {data} x="x" y="y" />
    
    <!-- AxisY with the properties that were problematic -->
    <AxisY
      tickSize={styles.gridLines === 'ticks' ? 6 : 0}
      tickPadding={styles.gridLines === 'ticks' ? 4 : 0}
      tickFontSize={styles.fontSize}
      stroke={styles.lineColor}
      dx={width}
      dy={styles.gridLines === 'grid' ? -styles.fontSize * 0.8 : 0}
      lineAnchor="center"
      textAnchor="end"
      title=""
      style="color:{styles.fontColor};"
      fill={styles.lineColor}
    />
    
    <!-- AxisX also accepts these properties -->
    <AxisX
      tickSize={6}
      tickPadding={4}
      tickFontSize={styles.fontSize}
      textAnchor="middle"
      style="color:{styles.fontColor};" 
      fill={styles.lineColor}
    />
  </Plot>
  
  <p><strong>Note:</strong> No <code>{`{...{} as any}`}</code> workaround needed!</p>
</div>

<style>
  div {
    padding: 1rem;
    font-family: sans-serif;
  }
  
  code {
    background: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
  }
  
  ul {
    margin: 1rem 0;
  }
  
  li {
    margin: 0.5rem 0;
  }
</style>