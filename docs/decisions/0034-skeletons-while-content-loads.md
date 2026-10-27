# 0034: Skeletons while content loads

- Status: accepted
- Date: 2026-10-27
- Issue: [#121](https://github.com/folkloreinc/panneau-js/issues/121)

## Context

Almost every loading state of Panneau 5 is a spinner where the content will be: the first page of a list, the item of a form or of the show panel, a preview, the definition at boot. Nothing says what is coming, and the layout jumps when it arrives. Only the media picker draws a skeleton, with its own CSS.

Panneau knows the shape of most of its content before the data: the definition gives a list's columns and page size, a form's fields and layout, the details of an item. It can draw that shape while the data loads.

## Decision

Content that loads shows a skeleton of its shape, not a spinner. This is a base principle of Panneau 5, for every package and every component that loads content.

- **A skeleton is the layout to come.** Its blocks are placeholders, in the layout of the content they stand for: the same grid, about the same sizes, and as many as is known.
    - A list: rows of its columns, as many as the page size, up to what fits.
    - A form: its layout, and for each field its label and a block of the field's height, from its type.
    - The details of an item: its fields.
    - A grid of media: cards.
    - The app at boot, before the definition: the shell, with the sidebar and a page header.
- **The components draw their own skeleton.** Lists, forms and media pickers draw it from what they are given, so a product that uses them without the app gets the same loading states. `@panneau/ui` has the `Skeleton` primitive they draw with.
- **It shows at once.** It holds the place of the content, so a fast load doesn't move the layout. There is no minimum duration.
- **Content already shown stays.** A refetch keeps it, dimmed, with `aria-busy`, as lists already do. A skeleton never replaces content.
- **Accessibility.** The skeleton's blocks are `aria-hidden`. The region that loads has `aria-busy="true"`, and announces the loading once with a status message.
- **Motion and theme.**
    - The blocks pulse, and stay still with `prefers-reduced-motion: reduce`.
    - Their colors and radii come from the theme's tokens.
    - They have the `panneau-skeleton` class of the theme model (decision 0024).
- **Errors.** A load that fails replaces the skeleton with an alert and a retry, as now.

Spinners stay for what isn't content loading in its place:

- an operation the user started: a pending button, a submitted form, an action that runs, the check of a dry run;
- a lookup inside a control: the search of a combo box, the lookup of an embed, the check of a slug.

## Consequences

- `@panneau/ui` gets `Skeleton`. The media picker's skeleton moves onto it.
- `ListView`, forms, the item panel, the preview and the boot of the app replace their spinner with a skeleton ([#121](https://github.com/folkloreinc/panneau-js/issues/121)).
- Every component that loads content has a loading story, checked by axe.
- `AGENTS.md` gets the rule, so new components follow it.
- Backends have nothing to do: the shape comes from the definition.
