# @panneau/ui

Design tokens, themes and accessible primitives of Panneau, built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/). Icons come from [Lucide](https://lucide.dev).

```bash
npm install @panneau/ui@^5.0.0-alpha.0 react-aria-components react-intl
```

```tsx
import { Button, PanneauRoot, TextInput, bootstrapTheme } from '@panneau/ui';

<PanneauRoot theme={bootstrapTheme} colorScheme="auto">
    <TextInput label="Title" isRequired />
    <Button variant="primary">Save</Button>
</PanneauRoot>;
```

| Export                | Content                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `@panneau/ui`         | `PanneauRoot`, themes, the primitives, `Icon`, `getNamedIcon()`, `useToast()`, `usePanneauIntl()` |
| `@panneau/ui/locales` | Deprecated: the UI messages by locale, `en` and `fr`. Use `@panneau/intl`                         |

## Root, tokens and themes

Every Panneau interface renders inside a `PanneauRoot`. It scopes the base stylesheet and the design tokens (`--panneau-*` CSS variables) to its element: Panneau adds no global CSS to the page. Overlays (dialogs, popovers, menus, tooltips) and toasts render inside it too.

- `colorScheme`: `light` (default), `dark`, or `auto`, which follows the system.
- `density`: `compact`, `comfortable`, `touch`, or `auto` (default), which is `touch` on touch screens and `comfortable` otherwise. See [Density](#density).
- `theme`: tokens, tones and variants that override the default theme (see [Defining themes](#defining-themes)). `bootstrapTheme` follows a site's Bootstrap 5.3 variables and color mode.
- A project can also override any token with its own class on the root: `.my-panneau { --panneau-color-accent: #0a58ca; }`.

The default theme and the icon set are explained in [decision 0020](../../docs/decisions/0020-default-theme-and-icons.md).

### Component tokens

Every component reads its own tokens, `--panneau-<component>-<token>`, which default to semantic tokens. Set one to restyle a single component, in a theme, on the root, or on any element around the components:

```css
.my-panneau {
    --panneau-badge-radius: var(--panneau-radius-sm); /* square badges, nothing else changes */
}

.my-toolbar {
    --panneau-button-padding-x: var(--panneau-space-2);
}
```

`componentTokens` lists every component token and its default, by component, and `ComponentTokenName` is their type. Some tokens style parts that several components share:

- `input`: the box of text inputs, selects, combo boxes and pickers;
- `field`: labels, descriptions and errors;
- `list-box`: options of selects, combo boxes and menus;
- `calendar`.

### Tones and appearances

Components with a color take a `tone`, like Bootstrap's theme colors: `neutral`, `accent`, `success`, `warning`, `danger` and `info` are built in. `Button`, `Badge` and `Alert` also take an `appearance` (`solid`, `outline`, `subtle`, and `ghost` for buttons):

```tsx
<Button tone="accent">Save</Button>
<Button tone="danger" appearance="outline">Remove</Button>
<Badge tone="success">Published</Badge>
<Alert tone="warning" appearance="solid" title="Scheduled" />
```

The `variant` values of `Button` (`primary`, `secondary`, `ghost`, `danger`) are deprecated aliases of a tone and an appearance.

A theme adds tones, from one color (Panneau derives a readable text color, the hover, the subtle background and the border) or with every value, and named variants of components:

```tsx
const theme = defineTheme({
    tones: { signal: '#f25c05' },
    components: {
        badge: { variants: { tag: { 'panneau-badge-radius': 'var(--panneau-radius-sm)' } } },
    },
});

declare module '@panneau/ui' {
    interface PanneauTones {
        signal: true;
    }
    interface BadgeVariants {
        tag: true;
    }
}

<Badge tone="signal" variant="tag">
    Live
</Badge>;
```

`checkTheme(theme)` reports the colors of a theme that miss their contrast ratio (4.5:1 for text, 3:1 for control borders), like Bootstrap's `$min-contrast-ratio`. It follows references to the theme's palette and tokens.

### Defining themes

`defineTheme()` declares a theme. TypeScript checks the name of every token, semantic or component, and the console reports unknown names in Panneau's namespaces (`panneau-color-txt`), such as typos in a theme loaded from JSON. A theme can name its raw colors once in a `palette`, written as `--panneau-palette-<name>`, and build on other themes with `extends`:

```ts
import { bootstrapTheme, defineTheme } from '@panneau/ui';

const brand = defineTheme({
    label: 'Brand',
    palette: { orange: '#f25c05', ink: '#1c1917' },
    tokens: {
        'panneau-color-accent': 'var(--panneau-palette-ink)',
        'panneau-button-radius': '0',
    },
    dark: { 'panneau-color-accent': '#fafaf9' },
    tones: { signal: 'var(--panneau-palette-orange)' },
});

// A variation: the same theme, more compact.
const compact = defineTheme({ extends: brand, tokens: { 'panneau-control-height': '2rem' } });

// The brand theme, on a site that uses Bootstrap.
const onBootstrap = defineTheme({ extends: [bootstrapTheme, brand] });
```

Values merge in this order, each overriding the ones before: the default theme, the themes a theme `extends` (in order), the theme itself, then a project's own class on the root. A token set in `tokens` but not in `dark` applies to both schemes, so it also replaces the dark value of the themes it extends. `mergeThemes()` merges themes the same way.

`defineTheme()` returns a plain `Theme`: themes are data. They can be written as JSON files, with the [`theme.schema.json`](../protocol/schema/theme.schema.json) of `@panneau/protocol`, registered by plugins of `@panneau/core`, and carried by the definition, whose `theme` extends themes of plugins by id. Tokens of a project's own components are declared in `PanneauTokens`:

```ts
declare module '@panneau/ui' {
    interface PanneauTokens {
        'panneau-map-marker-color': true;
    }
}
```

`SEMANTIC_TOKENS` lists the semantic tokens, `componentTokens` the component tokens.

### Typography and fonts

The theme has four font roles: `--panneau-font-family-body`, `-heading` (the body's by default), `-display` (the heading's by default) and `-mono`. `--panneau-font-family` is a deprecated alias of the body family: set `-body` instead, so that headings follow it. `--panneau-font-numeric` (`tabular-nums`) lines up digits in stats, dates and tables.

Panneau styles no element beyond its reset, since it is often embedded in someone else's page. Three components apply the typography of the theme:

- `Heading`: a `level` (`h1`–`h6`, 2 by default) and a visual `size`, independent of it: `1` to `4`, `display-1` and `display-2`, like Bootstrap's `.h1` and `.display-1`. Its tokens (`--panneau-heading-1-font-size`, `--panneau-heading-display-1-font-weight`…) set the size, weight, line height and letter spacing of each size.
- `Text`: `size` (`xs` to `xl`), `weight`, `family` (a font role), `tone`, `muted`, `numeric` and `truncate`, as a `p` by default (`as="span"`).
- `Prose`: styles the elements of rich content inside it (headings, lists, links, quotes, code, tables), such as the output of an editor or Markdown.

```tsx
<Heading level={1} size="display-2">
    1,204 pages
</Heading>
<Text muted size="sm">
    Updated today
</Text>
<Prose dangerouslySetInnerHTML={{ __html: page.body }} />
```

A theme declares its fonts: font faces, written as `@font-face` rules, or a hosted stylesheet. `PanneauRoot` adds them to the page once, however many roots use the theme.

```ts
const editorial = defineTheme({
    fonts: [
        { family: 'Geist', src: "url(/fonts/geist.woff2) format('woff2')", weight: '100 900' },
        { stylesheet: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@600&display=swap' },
    ],
    tokens: {
        'panneau-font-family-body': 'Geist, system-ui, sans-serif',
        'panneau-font-family-heading': 'Fraunces, Georgia, serif',
    },
});
```

### Layout

Five primitives lay out content with the space scale of the theme, without utility classes:

- `Stack`: items one under the other, like Bootstrap's `.vstack`;
- `Inline`: items side by side, wrapping when they don't fit, like `.hstack`;
- `Grid` and `GridItem`: equal columns (`columns`), or as many as fit (`minItemWidth="16rem"`), and cells that span several columns (`span`, or `span="full"`);
- `Container`: a centered column with a maximum width (`size`: `sm`, `md`, `lg` by default, `xl` or `full`);
- `Divider`: a line between groups, horizontal or vertical.

`gap` takes a step of the space scale (`gap={2}` is `--panneau-space-2`), and `align` and `justify` the alignment of the items. These props, `columns` and `span` are **responsive**: a value, or values by breakpoint, each applying from its breakpoint up.

```tsx
<Container>
    <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 3, lg: 4 }}>
        <GridItem span={{ base: 1, lg: 'full' }}>
            <Card title="Summary" />
        </GridItem>
        <Card title="Pages" />
        <Card title="Articles" />
    </Grid>
</Container>
```

Breakpoints (`BREAKPOINTS`) are `sm` 40rem, `md` 48rem, `lg` 64rem and `xl` 80rem, like `$grid-breakpoints`. They are widths of the nearest **size container**, not of the viewport, so that a grid in a narrow sidebar behaves as on a phone. `PanneauRoot` and `Container` are size containers, as are forms and lists. A size container takes its width from its parent, never from its content: in a flex row or a float, give the root a width, or it collapses.

Responsive values are inline CSS variables, read by static rules in each container query: no styles are generated per instance.

### Density

A density is a set of tokens: `--panneau-control-height` and `-sm`, `--panneau-font-size-control`, `--panneau-control-padding-x` (inputs and buttons) and `--panneau-row-padding-y` (rows of tables, options of lists). The `density` of the root picks one, and the `size` props of components (`size="sm"`) stay relative to it.

A theme redefines a density in `densities`. Density tokens set in `tokens` instead apply to every density, which then no longer changes them.

```ts
const roomy = defineTheme({
    densities: {
        comfortable: { 'panneau-control-height': '2.5rem' },
        compact: { 'panneau-row-padding-y': '0.125rem' },
    },
});
```

### Classes

Class names are stable and readable, without a hash, like Bootstrap's: target them in a project's CSS.

- The root of every component has `panneau-<component>`: `.panneau-button`, `.panneau-badge`, `.panneau-text-input`, `.panneau-card`.
- Its parts and modifiers are `panneau-<component>-<name>`: `.panneau-card-header`, `.panneau-button-sm`.
- States use standard attributes: ARIA (`[aria-invalid]`, `[aria-expanded]`, `[aria-selected]`…) and the state attributes of React Aria Components (`[data-hovered]`, `[data-focus-visible]`…).

```css
.my-panneau .panneau-badge {
    letter-spacing: 0.02em;
}

.my-panneau .panneau-text-input [aria-invalid='true'] {
    background-color: #fff5f5;
}
```

[`api/ui.classes.md`](api/ui.classes.md) lists every class. They are public API: a rename is a breaking change.

The theme model is described in [decision 0024](../../docs/decisions/0024-theme-model.md).

## Primitives

`Heading`, `Text`, `Prose`, `Stack`, `Inline`, `Grid`, `Container`, `Divider`, `Button`, `IconButton`, `TextInput`, `TextArea`, `NumberInput`, `Select` (single or multiple), `ComboBox`, `Checkbox`, `Switch`, `RadioGroup`, `DatePicker`, `TimeInput`, `Fieldset`, `Dialog`, `Popover`, `Menu`, `Tabs`, `Tooltip`, toasts (`useToast()`), `Alert`, `Badge`, `Spinner`, `Card`, `Disclosure` and `Icon`.

- Every component accepts `className`, and `xxxClassName` props for its inner elements (`labelClassName`, `inputClassName`…).
- Labelled controls take `label`, `description` and `errors` (a list of messages: any message makes the control invalid and describes it).
- They work on phones: larger touch targets on touch screens, dialogs as bottom sheets, scrolling tabs.

## Icons

Components take icons as components: any Lucide icon (`icon={Pencil}`), or a component with the same props.

Definitions name their icons (`"icon": "send"`, a name of [lucide.dev/icons](https://lucide.dev/icons)). `getNamedIcon(name)` turns a name into an icon component that goes wherever an icon component goes:

```tsx
import { Button, getNamedIcon } from '@panneau/ui';

<Button icon={getNamedIcon('send')}>Send</Button>;
```

- It loads that one icon the first time it renders, through Lucide's dynamic imports, and renders an empty space of the same size until then. The list of names is loaded on demand too: the whole set is never in the bundle, but bundlers emit one small chunk per icon.
- It returns the same component for the same name. A name Lucide doesn't have renders nothing, with a warning in the console.
- `loadNamedIcon(name)` loads an icon ahead of time, and resolves with its component (or `null`).
- **Vite apps, in development:** add `optimizeDeps: { exclude: ['lucide-react/dynamicIconImports.mjs'] }` to the Vite config. When Vite optimizes it together with `lucide-react`, it splits `lucide-react` into one chunk per icon (about 1,900 requests on every page load). Production builds are not affected.

## Messages

Strings go through react-intl, with English defaults.

- **Without an `IntlProvider`**, `PanneauRoot` provides one, with the messages of every Panneau package in its `locale`: `<PanneauRoot locale="fr">` renders in French. Without a `locale`, or with one that Panneau doesn't translate, it renders in English.
- **With an `IntlProvider`** (an app that uses react-intl for its own strings), the root keeps it and adds nothing. Add the messages of every Panneau package to the app's with [`@panneau/intl`](../intl):

```tsx
import { withPanneauMessages } from '@panneau/intl';

<IntlProvider locale="fr" messages={withPanneauMessages('fr', appMessages)}>
```

## Peer dependencies

`react` and `react-dom` 19.2+, `react-aria-components` 1.22+ and `react-intl` 12+.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md). Stories: `npm run storybook` at the root of the repository.
