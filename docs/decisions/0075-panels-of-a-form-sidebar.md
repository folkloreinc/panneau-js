# 0075: The panels of a form's sidebar, defined by the resource

- Status: accepted
- Date: 2026-11-09, amended 2026-11-24 for [#501](https://github.com/folkloreinc/panneau-js/issues/501) (the sidebar comes first on phones) and [#503](https://github.com/folkloreinc/panneau-js/issues/503) (a panel alone there doesn't repeat its title)
- Extends: [0074](0074-asides-next-to-lists-and-forms.md) (the `sidebar` nodes of form layouts), [0065](0065-compound-fields.md) (the `publication` component)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (Sidebars, a general principle)

## Context

Since [0074](0074-asides-next-to-lists-and-forms.md), each `sidebar` node of a form layout is a panel of the form's aside, with its fields. The roadmap puts more next to a form, as WordPress's editor does: the state of the item and what acts on it. Its Save and Publish buttons, the summary of the form's errors, its actions and links (its page on the site), then its preview, its revisions, and panels of plugins.

A resource decides which of these its form has, and in which order, the way its layout places its fields. A project must also be able to write a panel of its own as easily as a field or a `component` node. These blocks are not fields: most of them read the state of the form (unsaved changes, errors) or what the app knows of the item (its actions), and some act on it (save, publish).

## Decision

- **A panel is a `sidebar` node that names its component**, with `panel`:

    ```jsonc
    [
        { "type": "field", "name": "title" },
        { "type": "sidebar", "panel": "save" },
        {
            "type": "sidebar",
            "panel": "publication",
            "label": "Publication",
            "children": [
                { "type": "field", "name": "status" },
                { "type": "field", "name": "published_at" },
            ],
        },
        { "type": "sidebar", "panel": "errors" },
        { "type": "sidebar", "panel": "actions" },
    ]
    ```

    - The node is the panel: its `label` is its title, which collapses it ([0074](0074-asides-next-to-lists-and-forms.md)), and `visibleWhen` hides it. Its `children` are rendered and given to the component, which places them, as a `component` node does ([0065](0065-compound-fields.md)). Its `props` are the props of the component.
    - **A panel that no component provides renders its children**, as a `sidebar` node without `panel`: the fields it holds stay in the form.
    - A panel that has nothing to show renders nothing, and its aside shows no empty block (`errors` before a failed save).

- **Plugins register panels** under `panels`, a new kind of components of `@panneau/core`, by name. A panel gets `FormPanelProps` from `@panneau/forms`: the node, the form (its state through `useFormState`), its fields by name, and its children rendered. In the app, `useFormPage()` gives it the resource and the item. A later plugin overrides a panel of the same name, built-in ones included. `Form` also takes `panels`, which the app uses for its own.
- **Built-in panels:**
    - `save` (`@panneau/forms`): the state of the form ("Unsaved changes", "Saved", "Save failed"), the form's `actions` and its Save button.
    - `errors` (`@panneau/forms`): the summary of the errors after a failed save, each a link to its field.
    - `publication` (`@panneau/forms/publication`, with the `publication` component of [0065](0065-compound-fields.md)): the state of the item (`Published`, `Scheduled`, `Not published`, or the label and tone of its status), its fields, and a **Publish** button, or **Unpublish** once it is published, which sets the publication and saves. Publishing sets `published` to `true` when the form has it, or else `status` to `published` (`publishedStatus` of its `props`), and `published_at` to now when it is empty. Unpublishing sets `published` to `false`, or `status` to `draft` (`draftStatus`).
    - `actions` (`@panneau/app`): the actions of the item, as its page header shows them (duplicate, delete, its page on the site). The header then leaves them out.
- **`save` and `errors` show only beside the form.** Below 56rem the aside is not beside the form (see below), where they would be out of the user's way: the footer and the summary at the top of the form do their work there. Beside the form, a layout with `save` has no footer, and one with `errors` no summary at the top.
- **Below 56rem, the sidebar comes first, collapsed** (amended for [#501](https://github.com/folkloreinc/panneau-js/issues/501); [0074](0074-asides-next-to-lists-and-forms.md) put it under the form). What the panels say of the item (its publication, its date, its author) was at the end of the page, after every block of a long list. The form's aside is now `narrow="before"` (`AsideLayout`): under the width of the layout where it goes beside the form, it is rendered before the form's fields, in the order of the page, of the keyboard and of the screen alike (no CSS `order`).
    - It is **a disclosure, collapsed by default**: one line that names what it holds (the titles of its panels, or the labels of their fields for a panel without one: `Publication · Files`), with the error badge of its fields. It opens when one of its fields is revealed (a link of the error summary, the first error after a failed save), and its fields come first in the order of the errors.
    - It has **no box of its own** there: its panels keep theirs, so that their fields are as wide as those of the form.
    - **A panel that its button already names doesn't repeat its title** ([#503](https://github.com/folkloreinc/panneau-js/issues/503)): when the button names a single panel (`Publication`), that panel shows its content without its title, and doesn't collapse a second time inside the disclosure. Its heading stays in the page, `hidden`, so that its content keeps its name, and its elements stay the same, so that its fields keep their state when the layout widens. Panels named together on the button (`Publication · Files`) keep their titles, which tell them apart.
    - **All the sidebar comes first, not some of its panels.** A layout can't say which panels go first without a new property on its nodes, and a collapsed line costs little: the rest of the form starts right after it. A layout that wants a panel at the end on phones can put its fields in the form instead.
- **On a phone, the app's form page puts the footer at the bottom of the screen** (below the `lg` width of the root): fixed, from edge to edge, on the background of the page's card, clear of the home indicator; the form keeps its room under its last field. A footer sticky inside the card stopped short of the edges, on the background of the page, and Safari on iOS ends sticky elements above its own toolbar.
- **The example of the protocol puts them on its `pages`**, which the playground shows: `save`, `publication`, `actions` and `errors`. Other resources keep their layout until a project gives them panels.

## Not decided here

- **A default sidebar** for resources that don't declare one, such as those with a `Layout\Publication` of laravel-panneau: once the panels have been used on real resources.
- **Save draft** next to Publish, which needs drafts ([0009](0009-preview-drafts-revisions.md)); the **preview** and **revisions** panels; panels of plugins **for all resources** without a node in each layout; abilities that hide a panel.
- **The panels of the item panel** next to a list.
- **A `media` panel** for the forms of media resources: the media itself (image, video and its thumbnail) and its metadata.

## Consequences

- `@panneau/protocol`: `panel` on layout nodes. laravel-panneau describes it on its `Sidebar` node.
- `@panneau/core`: `panels` in `PanneauPlugin` and in the registry.
- `@panneau/forms`: `FormPanelProps`, the `save` and `errors` panels, `panels` on `Form`; `@panneau/forms/publication`: the `publication` panel in `publicationPlugin`.
- `@panneau/ui`: `AsidePanel` takes `isBesideOnly`, and an aside hides its empty panels.
- `@panneau/app`: the `actions` panel and `useFormPage()`.
- For [#501](https://github.com/folkloreinc/panneau-js/issues/501): `@panneau/ui`'s `AsideLayout` takes `narrow="before"` and `onBeforeChange`, and `Aside` takes `summary`, `summaryEnd`, `isExpanded` and `onExpandedChange` for its disclosure; an `AsidePanel` whose title is the text of that button hides its title there (#503). `@panneau/app`'s form page sets `--_panneau-form-footer-height` on its form, from the footer.
