# 0092: Empty states, avatars, tiles, button groups, breadcrumbs, and text areas with a header and a footer

- Status: proposed
- Date: 2026-11-19
- Issue: [#337](https://github.com/folkloreinc/panneau-js/issues/337)
- Builds on: [0005](0005-styling-and-theming.md), [0020](0020-default-theme-and-icons.md), [0024](0024-theme-model.md)

## Context

The app, the lists and the fields draw a few common pieces by hand, each in its own way:

- an empty list or widget is a sentence: "No items match the search or the filters.", "Nothing here yet.";
- the user's menu draws the first letter of their name in a circle, with its own CSS in the sidebar and in the dock;
- relation cards, recent items, sessions and passkeys each draw a row with a picture, a title, a description and buttons;
- buttons that belong together sit side by side with a gap, and a button with more choices is a button next to a menu;
- nothing shows where a page is among its parents.

Other design systems have a primitive for each, [shadcn/ui](https://ui.shadcn.com/docs/components) among them. `@panneau/ui` borrows their anatomy, not their code. They are built like its other components: props rather than sub-components, React Aria Components where it has the primitive, CSS Modules, component tokens, Lucide icons.

## Decision

### `EmptyState`

What a region shows when it has nothing to show: an icon, a title, a description, and actions.

- `icon`, `title`, `description` and `actions` props. The icon sits in a rounded square of the subtle surface.
- **Two sizes:** `md` for a list or a page, `sm` for a widget, a popover or a panel.
- The title is a paragraph by default. `headingLevel` makes it a heading, for a page that is empty as a whole.
- It replaces content that isn't there. **It is never shown while content loads**: a skeleton is ([0034](0034-skeletons-while-content-loads.md)).
- It isn't named `Empty`, which reads as an adjective in props and stories.

`ListView` and the widgets of the dashboard use it:

- an empty list says that there are no items yet, with the list's `emptyMessage` as its title;
- a list with no match says so, with "Clear filters" as its action;
- a widget without data shows the small size, without an icon.

### `Avatar` and `AvatarGroup`

A person's picture, or their initials.

- `name` gives the initials (the first letter of the first and the last words, by graphemes) and the color. `src` gives a picture: if it fails to load, the initials are shown.
- **The color comes from the name**: one of the categorical chart colors, picked by a hash of the name, mixed with the surface, under the text color. The same person has the same color everywhere, two people next to each other usually differ, and the initials read in both schemes: they are the text color on a light tint in the light scheme, and on a dark one in the dark scheme.
- **Sizes** `xs` (1.25rem) to `xl` (4rem); `sm` (1.75rem) is the size of the sidebar, and `xs` that of the dock.
- **A state in a tone**: `tone` (any tone of the registry, [0024](0024-theme-model.md)) draws a ring of the tone's solid color around the avatar, apart from the color of the name: an account that is disabled (`neutral`), one that uses too many resources (`warning`), one that is blocked (`danger`). Color alone says nothing to everyone ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)), so the state is also in words: `status` ("Disabled") is added to the avatar's label and to its name on hover. A decorative avatar leaves the words to the text next to it, such as a `Badge`. The ring's width is a token (`--panneau-avatar-ring-width`), and it has a gap of the surface between it and the avatar, so that it reads on any picture.
- **Decorative by default**, as an `Icon`: it sits next to the name. With `label`, it is an image with that name.
- `AvatarGroup` takes `people` (a name, and a picture, a tone and a status for each), overlaps their avatars, shows at most `max` of them (3 by default) and a "+2" for the rest. It is an image named by the list of every name ("Ada Lovelace, Grace Hopper and 2 others"), and each avatar shows its name on hover.

The user's menu draws its avatar with it. Presence on an item ([0008](0008-realtime-and-concurrency.md)) will use the group.

### `Tile` and `TileGroup`

A row that shows one thing: a media, a title, a description, actions.

- Not `Item`, which means an item of a resource everywhere in Panneau (`ItemDetails`, the item panel, `get_item`). `Entry`, `Row`, `Card` and `Summary` are taken too.
- `icon` draws an icon in a rounded square. `media` takes anything else: an `Avatar`, a thumbnail.
- `title`, `description`, `children` (more content under the description) and `actions` at the end.
- **Appearances** `plain` (default), `outline` and `subtle`; **sizes** `md` and `sm`.
- **`href` makes the whole tile a link**: the title is the link, and its hit area covers the tile. The actions stay above it, reachable and pressable on their own. The link goes through React Aria, so the app's router handles it.
- `TileGroup` is a list (`ul`), and its tiles are its items. It draws a line between them, and with `appearance="outline"`, a border around them all.

Relation cards, recent items, the sessions and passkeys of the account page and the media picker's list will move to it, one at a time.

### `ButtonGroup`

Buttons attached to each other: one border between two of them, rounded corners only at the ends.

- A `Group` of React Aria (`role="group"`), named by `label`.
- `orientation` is `horizontal` (default) or `vertical`.
- It takes `Button`, `LinkButton` and `IconButton`, and a `MenuTrigger` around one of them, which draws nothing of its own. **A split button** is a group of a button and an icon button that opens a menu: no component of its own.
- Solid buttons next to each other are parted by a line (`--panneau-button-group-separator-color`), so that two filled buttons don't merge.
- `SegmentedControl` stays for choosing a value. The group is for actions.

### `Breadcrumbs`

On React Aria's `Breadcrumbs`.

- `items` of `{ id, label, href }`. The last one is the current page: not a link, with `aria-current="page"`.
- Chevrons between them, hidden from assistive technologies. The navigation is named "Breadcrumbs".
- **`maxItems` folds the middle**: the first crumb, a "…" button with a menu of the folded ones, and the last ones. Long labels are cut with an ellipsis, with the full label on hover.
- Where it goes in the app is a decision of its own, with the "back" link of pages.

### Text areas with a header and a footer

`TextInput` already has content and buttons inside its box (`prefix`, `suffix`): units, icons, the button that shows a secret, the slug's "Generate" and "Open". What was missing is for `TextArea`:

- **`header` and `footer`** draw content inside the box, above and under the text: a hint, a character count, small buttons. The box gets the focus ring when the text has the focus.
- Buttons in them use `IconButton` or `Button` with `size="sm"`.

No `InputGroup` component wraps fields: each field already draws its box.

## Consequences

- `@panneau/ui` exports `EmptyState`, `Avatar`, `AvatarGroup`, `Tile`, `TileGroup`, `ButtonGroup` and `Breadcrumbs`, with their component tokens (`empty-state`, `avatar`, `tile`, `button-group`, `breadcrumbs`), and `TextArea` takes `header` and `footer`.
- `@panneau/lists`: empty lists and lists without a match show an `EmptyState`. Their messages stay.
- `@panneau/app`: widgets without data show a small `EmptyState`. `UserAvatar` draws an `Avatar`: the user has their initials and their color, rather than a first letter on the surface.
- Projects restyle them with their tokens and stable classes, like the other components.
