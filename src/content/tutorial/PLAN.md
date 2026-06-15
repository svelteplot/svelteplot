# Tutorial Plan

## Goal

Give new users a **playful, interactive introduction** to the mental model behind SveltePlot — not a complete feature reference. The tutorial is done when a user understands _why_ SveltePlot works the way it does and feels confident enough to read the docs on their own.

**The tutorial's job:** concepts. **The docs' job:** every option on every mark.

## Scope — what "done" looks like

The basics tutorial is **already essentially complete**:

- **01-basics** — getting-started + scales + axes/grids + faceting (≈15 lessons ✓)

The marks and transforms chapters inside 01-basics are **deferred**. Instead of duplicating the docs, mark-specific tutorials (e.g. "working with the Line mark") should be linked directly from the relevant docs pages. This keeps the main tutorial focused and finite.

**02-advanced** is a placeholder for future advanced tutorials.

---

Three levels map to the three directory levels: Part → Chapter → Lesson (REPL step).

---

## Tutorial structure

### Directory layout

```
<part>/                          e.g. 01-basics/
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

- Full-line add/remove: prefix the line with `+` or `-` (single character).
- Inline add/remove: wrap spans with `+++text+++` and `---text---`; multiple pairs on the same line are fine.
- Show the import change in a separate code block when a new component is imported.
- Keep prose short: one sentence of context, one instruction, one explanation of why.

---

## 01 · Basics (`01-basics/`)

### Getting started (`01-getting-started/`)

The idea of the basics section is to learn how to construct a plot with SveltePlot by combining the Plot component with marks and transforms.

- [x] Your first plot → `01-getting-started/01-first-plot`
- [x] Marks — what they are, swapping one for another → `01-getting-started/02-marks`
- [x] Layering marks → `01-getting-started/03-layering`
- [x] Channels (x, y, fill) → `01-getting-started/04-channels`
- [x] Color channels — quantitative fill → `01-getting-started/05-color-channels`
- [x] Reactivity → `01-getting-started/08-reactivity`

### Scales (`02-scales/`) 

In this chapter we learn how SveltePlot automatically determines the scales for our plot and how to customize them.

- Automatic scale domains
- Setting scale options: log, nice, padding, domain, etc.
- Bypassing scales
  - change `<RuleY y={0} />` to `<RuleY y={{ scale: null, value: 0 }} />` to bypass scale

### Transforms (`03-transforms/`) — DEFERRED

Transforms are useful when your dataset is not in the shape you need it to be visualized. Technically, the BarY mark requires

> See `## Transforms — DEFERRED` below.

### Scales (`04-scales/`)

The Plot component collects data from all marks and determines common scales.

- [x] Extending the domain — add `<RuleY y={0} />` → `04-scales/01-zero-rule`
- [x] The zero option — `y={{ zero: true }}` → `04-scales/02-zero-option`
- [x] Scale types — add `<RuleX x={new Date('2014-01-01')} />` → `04-scales/03-scale-type`

### Axes & grids (`05-axes-grids/`)

Axes are auto-added; they can be disabled or overridden.

- [x] Implicit axes → `05-axes-grids/01-implicit-marks`
- [x] Explicit axes → `05-axes-grids/02-explicit-axes`
- [x] Implicit grids → `05-axes-grids/03-implicit-grids`
- [x] Explicit grids → `05-axes-grids/04-explicit-grids`

### Faceting (`06-faceting/`)

Plots can be split into multiple panels via `fx`/`fy` channels.

- [x] Faceting basics → `06-faceting/01-faceting`
- [x] Unfaceted data in every panel → `06-faceting/02-unfaceted-data`

---

## 02 · Advanced (`02-advanced/`) — PLACEHOLDER

No lessons yet. Future candidates: plot defaults, overlays/underlays, HTML tooltips, image underlays.

## Marks — DEFERRED (`01-basics/02-marks/`)

> Not part of the main basics tutorial. Mark-specific tutorials (if written) should be short, self-contained, and linked from the corresponding docs page rather than chained into this tutorial. Answer to the question below: no.
>
> _Original question:_ do we really want to introduce all marks and their features? Isn't that duplicating the marks docs? Perhaps it should just touch on the different kinds of marks?

- SVG vs HTML
- Canvas rendering
- Point vs range
- One-row-per-element (dot, bar) vs. multiple-rows-per-element (line, area, ...)
- Geo marks
-

- **Marks** - Short introduction into the marks concept. Data, Channels, Style properties, common properties
- **Dot** (`01-basics/02-marks/01-dot/`)
  - The dot mark is a very versatile mark. It can be used for scatterplots, dot plots, beeswarm plots (in combination with the [dodge transform]).
  - [x] Symbol channel — shapes for categories → `01-dot/01-symbol`
  - [x] DotX / DotY — one-dimensional strip → `01-dot/02-dotx-doty`
  - [x] Size channel — bubble chart (r channel) → `01-dot/03-size-channel`
  - [ ] Color & opacity

- **Line** (`01-basics/02-marks/03-line/`) — Apple stock (aapl.csv)
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
- **Tick** (`01-basics/02-marks/02-tick/`) — faceted by species (`fy="species"`)
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

## Transforms — DEFERRED (`01-basics/03-transforms/`)

> Not part of the main basics tutorial. Same rationale as 03-marks above.

Transforms transform data into a shape that

- **Stacking**
  - [ ] Stacking means taking a single value and converting them into value ranges. Some marks implicitely stack your data, like AreaX or BarX, but you can also explicitely stack.
  - [ ] Explicit stacking example
  - [ ] Normalized stacks (offset: normalize)

- **Jitter** (`01-basics/03-transforms/01-jitter/`) — Cars dataset
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

## Mark families

Single x or y position:

- Rule
- Tick
- Axis
- Grid

x/y Position only:

- Dot
- Vector (x/y + rotation + length)
- Image
- Text
- Custom

Start and end positions

- Link
- Arrow
- Rect

Geographical marks

- Geo
- Sphere
- Graticule

Multiple data points to one element:

- Line
- Area
- Trail
- Density
- Contour

Composite marks:

- Difference
- Box
- Regression
