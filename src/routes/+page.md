---
title: SveltePlot
description: The best visualizations are built with <span>Svelte.</span>
heroImage: /logo.png
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
_features:
    - title: Marks
      description: SveltePlot comes with a powerful set of built-in marks for building for your visualizations
      icon:
          type: iconify
          collection: carbon
          name: roadmap
      link: /features/scales
    - title: Automatic scales
      description: Scale types and domains are automatically inferred from your data, unless you customize them
      icon:
          type: iconify
          collection: ri
          name: ruler-line
      link: /features/scales
    - title: Fully reactive
      description: Everything in SveltePlot is fully reactive, the plot just updates when the data or configuration changes
      icon:
          type: iconify
          collection: ri
          name: svelte-line
      link: /features/interactivity
    - title: TypeScript
      description: All components are fully typed and documented to integrate with VSCode
      icon:
          type: iconify
          collection: nonicons
          name: typescript-16
      link: /features/scales
    - title: Customizable
      description: All components are fully typed and documented to integrate with VSCode
      icon:
          type: iconify
          collection: nonicons
          name: typescript-16
      link: /features/scales
    - title: Written in Svelte5 & TypeScript
      description: All components and props are fully reactive, typed and documented!
      icon:
          type: iconify
          collection: ri
          name: svelte-line
      link: /features/scales
---

<style lang="scss">
  main {

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
