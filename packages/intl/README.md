# @panneau/intl

The UI messages of the Panneau packages, in English and French, with helpers to merge them with an app's messages.

```tsx
import { IntlProvider } from 'react-intl';

import { withPanneauMessages } from '@panneau/intl';

<IntlProvider locale="fr" messages={withPanneauMessages('fr', appMessages)}>
    <App />
</IntlProvider>;
```

| Export          | Content                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `@panneau/intl` | `en`, `fr`, `panneauMessages`, `getPanneauMessages()`, `withPanneauMessages()`, the message descriptors |

## Messages of every package

The messages of `@panneau/ui`, `@panneau/fields`, `@panneau/forms` and `@panneau/lists` live here, so an app adds one import, whichever packages it uses:

- **`withPanneauMessages(locale, messages)`** merges the messages of every package for a locale with the app's. The app's win, so it can reword a Panneau message by its id (`'panneau.forms.save'`).
- **`getPanneauMessages(locale)`** returns the messages of every package for a locale. A regional locale (`fr-CA`) gets those of its language. A locale Panneau doesn't translate gets none, and components fall back to their English defaults.
- **`en`** and **`fr`** are the catalogs, by id, and **`panneauMessages`** has them by locale.

English is also the default text of every message (`defaultMessage`), so components render in English without any of these. Without an `IntlProvider`, `PanneauRoot` (from `@panneau/ui`) provides one with `getPanneauMessages()` in its `locale`.

With `@panneau/core` plugins, `fieldsPlugin` (from `@panneau/fields`) carries `fr`, and `loadMessages(registry, locale)` returns it.

## Descriptors

`uiMessages`, `fieldsMessages`, `formsMessages` and `listsMessages` are the message descriptors the components format, with their ids and English text. Their type, `PanneauMessage<Values>`, gives react-intl the values each message takes, so `formatMessage()` checks them.

Message ids are part of the public API: renaming one breaks the apps that override it. Ids start with `panneau.<package>.`.

## Translations

A test checks, in CI, that every message of every package has a French translation, that French has no unknown ids, and that each translation uses the same ICU arguments as its English text. A new message needs its French text in `src/fr/<package>.ts`.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
