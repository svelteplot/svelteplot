# Tutorial Plan

Three levels map to the three directory levels: Part → Chapter → Lesson (REPL step).

Structure mirrors SveltePlot's own organisation: **01-basics → 02-plot → 03-marks → 04-transforms**.
Chapter and lesson ordering within 03-marks and 04-transforms is TBD.

---

## Tutorial structure

### Directory layout

```
<part>/                          e.g. 02-plot/
  index.md                       part title + optional intro text
  +assets/                       shared files for every lesson in the part
    src/lib/penguins.csv
    src/routes/+page.svelte
    ...
  <chapter>/                     e.g. 01-scales/
    index.md                     chapter title (body usually empty)
    +assets/                     shared files for every lesson in this chapter
      src/lib/aapl.csv
    <lesson>/                    e.g. 01-zero-rule/
      index.md                   lesson prose + code diffs (frontmatter: title)
      +assets/
        app-a/src/lib/App.svelte   starting state shown to the user
        app-b/src/lib/App.svelte   solution state (shown when "Solve" is clicked)
```

### File merging

The REPL's starting state (`a`) is built by merging three layers in order:

1. **Part-level** `+assets/` — routes boilerplate, shared datasets
2. **Chapter-level** `+assets/` — data files used across all lessons in the chapter
3. **Lesson `app-a/`** — the editable `App.svelte` and any lesson-specific files

When the user clicks **Solve**, only the `app-b/` files are merged on top of `a`. This means `app-b` only needs to contain files that actually change — typically just `App.svelte`. All other files (CSV data, routes, etc.) carry over automatically.

### Lesson prose conventions

- Use `+++added lines+++` and `---removed lines---` inside fenced code blocks to produce diff highlighting.
- Show the import change in a separate code block when a new component is imported.
- Keep prose short: one sentence of context, one instruction, one explanation of why.

---

## 01 · Basics

The idea of the basics chapter is to learn how to construct a plot with SveltePlot by combining the Plot component with marks and transforms. This could lightly introduce the concept of a grammar of graphics.

- **Getting started**
  - [x] Your first plot → `01-basics/01-getting-started/01-first-plot`
  - [x] Marks — what they are, swapping one for another, introducing dot and line → `01-getting-started/02-marks`
  - [x] Layering marks → `01-getting-started/03-layering`
  - [x] Channels (x, y, fill) → `01-getting-started/04-channels`
  - [x] Color channels — quantitative fill → `01-getting-started/05-color-channels`
  - [x] Reactivity → `01-getting-started/08-reactivity` - add a slider for cutting a data array that's fed into a line

---

## 02 · Plot

This chapter introduces the main purpose of the plot component that is to collect the data from the marks and determine common scales.

- **Scales** - the plot component determines the scale types based on the data that are passed through all marks.
  - [x] example with a line mark and AAPL dataset. Ask user to add a `<RuleY y={0} />` to see how the plot scales extend to zero automatically. → `01-scales/01-zero-rule`
  - [x] Same AAPL plot, again without the RuleY. Ask user to extend axis to zero by adding scale option `y={{ zero: true }}` → `01-scales/02-zero-option`
  - [x] Plot with AAPL line data and a `<RuleX x={2014} />`. This forces the x scale to be linear. The fix is to change to `<RuleX x={new Date('2014-01-01')} />` → `01-scales/03-scale-type`
- **Faceting** - plots can be split up into multiple facets.
  - [x] Faceting basics (fx/fy) → `01-basics/03-faceting/01-faceting`
  - [ ] Mix unfaceted with faceted data → `01-basics/03-faceting/01-unfaceted-data` (use gray dots in background + overlay with faceted dots)
- **Plot defaults** - Users can set plot properties using the `setPlotDefaults` hook which will applied to all nested plots and marks.
- **Overlays and underlays** - This chapter explains how to add HTML layers to a plot using the `overlay` snippet:
  - [ ] Overlay: link to the HTMLTooltip chapter
  - [ ] Underlay, but an image background behind the plot
- **Axes & grids** - Plots come with axes by default, those are implicitely added for convenience but they can also be disabled or added explicitely (covered in Marks > Axes)
  - [x] Implicit axes — auto-added AxisX/AxisY → `01-basics/02-axes-grids/01-implicit-marks`
  - [x] Explicit axes — overriding defaults → `02-axes-grids/02-explicit-axes`
  - [x] Implicit grids → `02-axes-grids/03-implicit-grids`
  - [x] Explicit grids — GridX/GridY, strokeDasharray, strokeOpacity → `02-axes-grids/04-explicit-grids`
- **Title, Desc, Footer** - The Plot component is for convenience. It renders the `<figure>` element surrounding the svg. You can add a plot title.

## 03 · Marks

We're introducing every mark components with a short tutorial. You can jump directly to the marks you want to learn more about. Marks receive data.

QUESTION: do we really want to introduce all marks and their features? Isn't that duplicating the marks docs? Perhaps it should just touch on the different kinds of marks?

- SVG vs HTML
- Canvas rendering
- Point vs range
- One-row-per-element (dot, bar) vs. multiple-rows-per-element (line, area, ...)
- Geo marks
-

- **Marks** - Short introduction into the marks concept. Data, Channels, Style properties, common properties
- **Dot** (`02-marks/01-dot/`)
  - The dot mark is a very versatile mark. It can be used for scatterplots, dot plots, beeswarm plots (in combination with the [dodge transform]).
  - [x] Symbol channel — shapes for categories → `01-dot/01-symbol`
  - [x] DotX / DotY — one-dimensional strip → `01-dot/02-dotx-doty`
  - [x] Size channel — bubble chart (r channel) → `01-dot/03-size-channel`
  - [ ] Color & opacity

- **Line** (`02-marks/03-line/`) — Apple stock (aapl.csv)
  - The line mark is useful for showing change. It accepts an array of positions that get connected through a line.
  - [x] The Line mark — time series → `03-line/01-line`
  - [x] Sorting — sort transform for non-temporal x → `03-line/02-sorting` - the line mark connects the data points in the order they appear in thet data. If your data comes in the wrong order, you can sort it before passing it to the line mark
  - [ ] More convenient sorting using the built-in `sort` transform.
  - [x] Multiple series — stroke channel + group → `03-line/03-grouping`
  - [x] Markers — arrowhead / dot markers → `03-line/04-markers`
  - [ ] Custom marker snippet
  - [x] Curve — interpolation options → `03-line/05-curve`
  - [x] Text along lines — inline labels → `03-line/06-text`

- **Area** (TBD)
  - [ ] AreaY — area below a line
  - [ ] AreaX — horizontal area
  - [ ] Band / range area (y1 and y2 channels)
  - [ ] DifferenceY — difference / above-below chart

- **Rect** (TBD)
  - The rect mark is one of three marks that are rendering rectangles to a plot, depending on your x and y axis. Here's an overview on which marks to use in which scenario:
    | | y scale is quantitative | y scale is qualitative |
    | ------------------------------------ | :---------------------: | :--------------------: |
    | **x scale is quantitative** | Rect | BarX |
    | **x scale is qualitative** | BarY | Cell |

  - [ ] Rect: no stacking - The `Rect` mark requires four channes x1, x2, y1, y2 that define the bounds of each rectangle. _Create a plot with custom rectangles_
  - [ ] RectX and RectY for range annotations
  - [ ] RectY + bin transform — basic histogram
  - [ ] RectX — horizontal histogram

- **Bar** (TBD)
  - [ ] BarY — vertical bar chart
  - [ ] BarX — horizontal bar chart
  - [ ] Color channel on bars

- **Cell** (TBD)
  - [ ] Cell — basic heatmap (x/y as categories, fill as value)
  - [ ] CellX / CellY — one axis is categorical

- **Rule** (TBD)
  - [ ] RuleY — horizontal reference line
  - [ ] RuleX — vertical reference line

- **Frame**
  - [ ] Frames can be added implicitely by setting the frame property on the Plot component. But you can also add frames explicitely using the frame mark.
  - [ ] Frames can be manipulated
  - [ ] You can use a frame mark for clipping
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
  - [ ] Tooltip mark
  - [ ] BrushX / BrushY / Brush — selection

- **Advanced** (TBD)
  - [ ] Density / Contour
  - [ ] DelaunayLink / Hull / Voronoi
  - [ ] Raster
  - [ ] CustomMark / CustomMarkHTML

---

## 04 · Transforms

Transforms transform data into a shape that

- **Stacking**
  - [ ] Stacking means taking a single value and converting them into value ranges. Some marks implicitely stack your data, like AreaX or BarX, but you can also explicitely stack.
  - [ ] Explicit stacking example
  - [ ] Normalized stacks (offset: normalize)

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

- **Group** (TBD)
  - [ ] Grouped bar chart
  - [ ] Aggregating into cells (Cell + group)

- **Dodge** (TBD)
  - [ ] Dodge — non-overlapping layout
  - [ ] Beeswarm plot

- **Normalize** (TBD)

- **Density** (TBD)
  - [ ] Density mark — kernel density estimation
  - [ ] Contour mark — density contour lines
