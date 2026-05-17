# Tutorial Plan

Three levels map to the three directory levels: Part → Chapter → Lesson (REPL step).

Structure mirrors SveltePlot's own organisation: **01-basics → 02-marks → 03-transforms**.
Chapter and lesson ordering within 02-marks and 03-transforms is TBD.

## Dataset decisions

- **01 · Basics** — Palmer Penguins throughout; first mark is `Dot` (not `Line`)
- **02 · Marks / Line** — Apple stock (aapl.csv) for single series; BLS + polls for multi-series
- **02 · Marks / Jitter** — Cars dataset (cylinders × power (hp)); `jitterX` requires quantitative x

---

## 01 · Basics

- **Getting started**
  - [x] Your first plot → `01-basics/01-getting-started/01-first-plot`
  - [x] Marks — what they are, swapping one for another → `01-getting-started/02-marks`
  - [x] Layering marks → `01-getting-started/03-layering`
  - [x] Channels (x, y, fill) → `01-getting-started/04-channels`
  - [x] Color channels — quantitative fill → `01-getting-started/05-color-channels`
  - [x] Legends → `01-getting-started/06-legend`
  - [x] Scale options → `01-getting-started/07-scale-options`
  - [x] Reactivity → `01-getting-started/08-reactivity`

- **Axes & grids**
  - [x] Implicit axes — auto-added AxisX/AxisY → `01-basics/02-axes-grids/01-implicit-marks`
  - [x] Explicit axes — overriding defaults → `02-axes-grids/02-explicit-axes`
  - [x] Implicit grids → `02-axes-grids/03-implicit-grids`
  - [x] Explicit grids — GridX/GridY, strokeDasharray, strokeOpacity → `02-axes-grids/04-explicit-grids`

- **Faceting**
  - [x] Faceting basics (fx/fy) → `01-basics/03-faceting/02-faceting`
  - [ ] Facet options (gap, label, axis placement)

---

## 02 · Marks

- **Dot** (`02-marks/01-dot/`)
  - [x] Symbol channel — shapes for categories → `01-dot/01-symbol`
  - [x] DotX / DotY — one-dimensional strip → `01-dot/02-dotx-doty`
  - [x] Size channel — bubble chart (r channel) → `01-dot/03-size-channel`
  - [ ] Color & opacity

- **Line** (`02-marks/03-line/`) — Apple stock (aapl.csv)
  - [x] The Line mark — time series → `03-line/01-line`
  - [x] Sorting — sort transform for non-temporal x → `03-line/02-sorting`
  - [x] Multiple series — stroke channel + group → `03-line/03-grouping`
  - [x] Markers — arrowhead / dot markers → `03-line/04-markers`
  - [x] Curve — interpolation options → `03-line/05-curve`
  - [x] Text along lines — inline labels → `03-line/06-text`

- **Area** (TBD)
  - [ ] AreaY — area below a line
  - [ ] AreaX — horizontal area
  - [ ] Band / range area (y1 and y2 channels)
  - [ ] DifferenceY — difference / above-below chart

- **Bar** (TBD)
  - [ ] BarY — vertical bar chart
  - [ ] BarX — horizontal bar chart
  - [ ] Color channel on bars

- **Rect** (TBD)
  - [ ] RectY + bin transform — basic histogram
  - [ ] RectX — horizontal histogram

- **Cell** (TBD)
  - [ ] Cell — basic heatmap (x/y as categories, fill as value)
  - [ ] CellX / CellY — one axis is categorical

- **Rule** (TBD)
  - [ ] RuleY — horizontal reference line
  - [ ] RuleX — vertical reference line

- **Tick** (`02-marks/02-tick/`) — faceted by species (`fy="species"`)
  - [x] TickX / TickY — tick strip / rug plot → `02-tick/01-tickx-ticky`

- **Text** (TBD)
  - [ ] Text mark — positioning, formatting, alignment

- **Arrow / Link** (TBD)
  - [ ] Arrow — curved labeled arrows between points
  - [ ] Link — straight line between two data points

- **Vector** (TBD)
  - [ ] Vector — directional / wind field
  - [ ] Spike — magnitude as spike height

- **Box** (TBD)
  - [ ] BoxY — vertical box plot
  - [ ] BoxX — horizontal box plot

- **Regression** (TBD)
  - [ ] RegressionY — linear regression line
  - [ ] RegressionX

- **Other statistical marks** (TBD)
  - [ ] BollingerY
  - [ ] Trail — temporal path with varying stroke width

- **Geographic** (TBD)
  - [ ] Geo — rendering GeoJSON features with a projection
  - [ ] Sphere and Graticule — globe outline and grid lines

- **Interaction** (TBD)
  - [ ] Pointer mark — nearest-point hover / tooltip
  - [ ] BrushX / BrushY / Brush — selection

- **Advanced** (TBD)
  - [ ] Density / Contour
  - [ ] DelaunayLink / Hull / Voronoi
  - [ ] Raster
  - [ ] CustomMark / CustomMarkHTML

---

## 03 · Transforms

- **Jitter** (`03-transforms/01-jitter/`) — Cars dataset
  - [x] Jitter transform — spreading overlapping points → `01-jitter/01-jitter`
  - [x] Reactive jitter — width control via $state → `01-jitter/02-reactive-jitter`

- **Window** (TBD)
  - [ ] Moving average — window transform
  - [ ] Bollinger bands

- **Bin** (TBD)
  - [ ] Basic histogram (RectY + bin)
  - [ ] Bin options — thresholds, step, domain
  - [ ] 2D binning — frequency heatmap

- **Stack** (TBD)
  - [ ] Stacked bars / areas
  - [ ] Normalized stacks (offset: normalize)

- **Group** (TBD)
  - [ ] Grouped bar chart
  - [ ] Aggregating into cells (Cell + group)

- **Dodge** (TBD)
  - [ ] Dodge — non-overlapping layout

- **Normalize** (TBD)

- **Density** (TBD)
  - [ ] Density mark — kernel density estimation
  - [ ] Contour mark — density contour lines
