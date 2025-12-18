---
title: SveltePlot
description: The best visualizations are built with <span>Svelte.</span>
heroImage: /logo.svg
tagline: A Svelte-native visualization framework based on the layered grammar of graphics principles.
actions:
    - label: Getting started
      type: primary
      to: /getting-started
    - label: Why SveltePlot?
      to: /why-svelteplot
      type: flat
    - label: Examples
      to: /examples
      type: flat
examples:
    - area/smoothed-area
    - area/density
    - area/layered-density
    - area/streamgraph
    - area/violin
    - area/ridgeline
    - arrow/metro
    - axis/datawrapper-ticks
    - bar/faceted-bars
    - box/box-x-faceted
    - box/box-y
    - box/box-y-facet
    - brush/overview-detail
    - cell/temperatures-threshold
    - custom/histogram-topline
    - difference/anomaly-baseline
    - difference/apple-yoy
    - difference/trade-balance
    - dot/1-colored-scatterplot
    - dot/beeswarm-bubbles
    - dot/dot-faceted
    - dot/dodge-faceted
    - geo/earthquakes
    - geo/us-choropleth
    - image/image-scatter
    - image/image-beeswarm
    - line/geo-line
    - line/gradient-line
    - line/indexed-stocks
    - line/running-mean
    - line/parallel-x
    - line/penguins-cdf
    - line/parallel-y-hl
    - link/spherical-link
    - rect/binned
    - rect/marimekko
    - rect/marimekko-faceted
    - rect/stacked-histogram
    - regression/grouped
    - regression/log
    - rule/data-rules
    - tick/tick-x
    - trail/countries
    - trail/napoleon
    - trail/tdf
    - vector/spike-map
    - vector/wind
    - waffle/custom-symbol
    - waffle/stacked-x
_features:
    - title: Marks
      description: SveltePlot comes with a powerful set of built-in marks for building for your visualizations
      icon:
          type: iconify
          collection: carbon
          name: roadmap
    - title: Automatic scales
      description: Scale types and domains are automatically inferred from your data, unless you customize them
      icon:
          type: iconify
          collection: ri
          name: ruler-line
    - title: Fully reactive
      description: Everything in SveltePlot is fully reactive, the plot just updates when the data or configuration changes
      icon:
          type: iconify
          collection: ri
          name: svelte-line
    - title: TypeScript
      description: All components are fully typed and documented to integrate with VSCode
      icon:
          type: iconify
          collection: nonicons
          name: typescript-16
    - title: Customizable
      description: All components are fully typed and documented to integrate with VSCode
      icon:
          type: iconify
          collection: nonicons
          name: typescript-16
    - title: Written in Svelte5 & TypeScript
      description: All components and props are fully reactive, typed and documented!
      icon:
          type: iconify
          collection: ri
          name: svelte-line
---

<footer class={['text-gray-5', 'text-small']}>
  <a class="text-gray-5" href="https://www.netlify.com">
    This site is powered by Netlify
  </a>
</footer>

<style lang="scss">
  main {

  }
  footer {
    margin-top: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    a {
      color: rgb(156 163 175  / var(--un-text-opacity));
      text-decoration: none;
      font-size: 0.9rem;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  article {
   margin-left: auto;
   margin-right: auto;
  }
  :global {
    .intro .gradient-title {
      font-weight: 750;
    }
    .intro .description {
      font-size: 2.8rem!important;
      font-weight: 600!important;
      line-height: 1.1!important;
      text-wrap: balance;
    }
    @media (max-width: 600px) {
      .intro .description {
        font-size: 2rem!important;
      }
    }
    .svp-action--primary span {
      color: white;
    }
    .hero-image img {
      width: 20rem!important;
      max-width: 100%!important;
    }
  }
</style>
