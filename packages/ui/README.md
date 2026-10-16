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

| Export                | Content                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `@panneau/ui`         | `PanneauRoot`, themes, the primitives, `Icon`, `useToast()`, `usePanneauIntl()` |
| `@panneau/ui/locales` | Deprecated: the UI messages by locale, `en` and `fr`. Use `@panneau/intl`       |

## Root, tokens and themes

Every Panneau interface renders inside a `PanneauRoot`. It scopes the base stylesheet and the design tokens (`--panneau-*` CSS variables) to its element: Panneau adds no global CSS to the page. Overlays (dialogs, popovers, menus, tooltips) and toasts render inside it too.

- `colorScheme`: `light` (default), `dark`, or `auto`, which follows the system.
- `theme`: tokens that override the default theme. `bootstrapTheme` follows a site's Bootstrap 5.3 variables and color mode.
- A project can also override any token with its own class on the root: `.my-panneau { --panneau-color-accent: #0a58ca; }`.

The default theme and the icon set are explained in [decision 0020](../../docs/decisions/0020-default-theme-and-icons.md).

## Primitives

`Button`, `IconButton`, `TextInput`, `TextArea`, `NumberInput`, `Select` (single or multiple), `ComboBox`, `Checkbox`, `Switch`, `RadioGroup`, `DatePicker`, `TimeInput`, `Fieldset`, `Dialog`, `Popover`, `Menu`, `Tabs`, `Tooltip`, toasts (`useToast()`), `Alert`, `Badge`, `Spinner`, `Card`, `Disclosure` and `Icon`.

- Every component accepts `className`, and `xxxClassName` props for its inner elements (`labelClassName`, `inputClassName`…).
- Labelled controls take `label`, `description` and `errors` (a list of messages: any message makes the control invalid and describes it).
- They work on phones: larger touch targets on touch screens, dialogs as bottom sheets, scrolling tabs.

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
