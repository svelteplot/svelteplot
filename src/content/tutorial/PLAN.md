# Tutorial Plan

Three levels map to the three directory levels: Part → Chapter → Lesson (REPL step).
`→ reuse` notes where existing content can be adapted from its old location.

## Dataset decisions

- **01 · Basics** — Palmer Penguins throughout; first mark is `Dot` (not `Line`)
- **03 · Line & area** — Apple stock (aapl.csv) for single series; multi-series TBD

---

## 01 · Basics

- **Getting started**
  - [x] Your first plot → `01-basics/01-getting-started/01-first-plot`
  - [x] Marks — what they are, swapping one for another → `01-getting-started/02-marks`
  - [x] Layering marks → `01-getting-started/03-layering`
  - [x] Channels (x, y, stroke, fill, r) → `01-getting-started/04-channels`
  - [x] Color channels → `01-getting-started/05-color-channels`
  - [x] Legends → `01-getting-started/06-legend`
  - [x] Scale options → `01-getting-started/07-scale-options`
  - [x] Reactivity → `01-getting-started/08-reactivity`

- **Axes & grids**
  - [x] Implicit axes — auto-added AxisX/AxisY → `01-basics/06-implicit-marks/01-implicit-marks`
  - [x] Explicit axes — overriding defaults → `06-implicit-marks/02-explicit-axes`
  - [x] Implicit grids → `06-implicit-marks/03-implicit-grids`

- **Faceting**
  - [x] Faceting basics (fx/fy) → `01-basics/04-faceting/02-faceting`
  - [ ] Facet options (gap, label, axis placement)

---

## 02 · Scatter & distribution

- **Dot mark**
  - [x] Symbol channel (shapes for categories) → `02-scatter/01-dot/01-symbol`
  - [x] Size channel — bubble chart (r channel) → `02-scatter/01-dot/03-size-channel`

- **Jitter** — uses **cars dataset** (cylinders × power (hp)); jitterX works on quantitative x only
  - [x] Jitter transform — spreading overlapping points → `02-scatter/02-jitter/01-jitter`
  - [x] Reactive jitter (width control) → `02-scatter/02-jitter/02-reactive-jitter`

- **Strip plots** — faceted by species (`fy="species"`) for a richer end state
  - [x] DotX / DotY — one-dimensional scatter → `02-scatter/03-strip-plots/01-dotx-doty`
  - [x] TickX / TickY — strip / rug plots → `02-scatter/03-strip-plots/02-tickx-ticky`

---

## 03 · Line & area

- **Line mark**
  - [x] The Line mark — time series → reuse `02-marks/02-line/01-line`
  - [x] Sorting — sort transform for non-temporal x → reuse `02-line/02-sorting`
  - [x] Multiple series — stroke channel + group → reuse `02-line/03-grouping`
  - [x] Markers — arrowhead / dot markers → reuse `02-line/04-markers`
  - [x] Curve — interpolation options → reuse `02-line/05-curve`
  - [x] Text along lines — inline labels → reuse `02-line/06-text`

- **Area mark**
  - [ ] AreaY — area below a line
  - [ ] AreaX — horizontal area
  - [ ] Stacked areas — stack transform
  - [ ] Band / range area (y1 and y2 channels)

- **Statistical overlays**
  - [ ] Moving average — window transform → reuse `01-basics/03-transforms/03-moving-average` + `04-moving-average-2`
  - [ ] Bollinger bands — BollingerY mark

- **Trail mark**
  - [ ] Trail — temporal path with varying stroke width

---

## 04 · Bar charts

- **Bar marks**
  - [ ] BarY — vertical bar chart
  - [ ] BarX — horizontal bar chart
  - [ ] Color channel on bars

- **Stacked bars**
  - [ ] Stack transform — stacked bar chart
  - [ ] Normalized stacks (stack offset: normalize)

- **Grouped bars**
  - [ ] Group transform — grouped bar chart

- **Waffle charts**
  - [ ] WaffleX / WaffleY — part-to-whole alternative to bars

---

## 05 · Histograms & rectangles

- **Histograms**
  - [ ] RectY + bin transform — basic histogram
  - [ ] Bin options — thresholds, step, domain
  - [ ] RectX — horizontal histogram

- **2D binning**
  - [ ] Two binned axes — frequency heatmap with RectY

---

## 06 · Heatmaps

- **Cell mark**
  - [ ] Cell — basic heatmap (x/y as categories, fill as value)
  - [ ] CellX / CellY — one axis is categorical
  - [ ] Group transform — aggregating into cells

- **Color scales**
  - [ ] Sequential color scales
  - [ ] Diverging color scales

---

## 07 · Annotations

- **Reference lines**
  - [ ] RuleY — horizontal reference line
  - [ ] RuleX — vertical reference line

- **Text labels**
  - [ ] Text mark — positioning, formatting, alignment
  - [ ] Avoiding overlap

- **Connectors**
  - [ ] Arrow — curved labeled arrows between points
  - [ ] Link — straight line between two data points

- **Vectors & decorations**
  - [ ] Vector — directional / wind field
  - [ ] Frame — explicit plot frame
  - [ ] Image — images at data positions

---

## 08 · Statistical marks

- **Box plots**
  - [ ] BoxY — vertical box plot
  - [ ] BoxX — horizontal box plot

- **Regression**
  - [ ] RegressionY — linear regression line → reuse `01-basics/04-faceting/01-regression` (partial)
  - [ ] RegressionX

- **Comparison**
  - [ ] DifferenceY — difference / above-below chart

- **Spike mark**
  - [ ] Spike — magnitude as spike height (spike maps)

---

## 09 · Geographic

- **Geographic marks**
  - [ ] Geo — rendering GeoJSON features with a projection
  - [ ] Sphere and Graticule — globe outline and grid lines

---

## 10 · Interaction

- **Pointer**
  - [ ] Pointer mark — nearest-point hover / tooltip

- **Brush**
  - [ ] BrushX — 1D horizontal selection
  - [ ] BrushY — 1D vertical selection
  - [ ] Brush — 2D selection

---

## 11 · Advanced

- **Density & contours**
  - [ ] Density mark — kernel density estimation
  - [ ] Contour mark — density contour lines

- **Voronoi & Delaunay**
  - [ ] DelaunayLink / DelaunayMesh — triangulation edges
  - [ ] Hull — convex hull per group
  - [ ] Voronoi / VoronoiMesh — Voronoi cells

- **Raster**
  - [ ] Raster — canvas-rendered raster / image data

- **Custom marks**
  - [ ] CustomMark — SVG-based custom mark
  - [ ] CustomMarkHTML — HTML overlay mark
