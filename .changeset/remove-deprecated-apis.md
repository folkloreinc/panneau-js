---
'@panneau/ui': minor
'@panneau/app': minor
'@panneau/fields': minor
'@panneau/forms': minor
'@panneau/codemods': minor
'@panneau/actions': patch
'@panneau/lists': patch
'@panneau/media': patch
---

The deprecated APIs are removed before the first beta, so that 5.0.0 ships without them. To migrate a project that started on an alpha:

- **Buttons:** `variant="primary"`, `secondary`, `ghost` and `danger` of `Button`, `LinkButton` and `IconButton` are gone, with the `ButtonVariant` type. Run `npx @panneau/codemods@alpha button-variants resources/js` (`--dry` first): it gives each button the `tone` and the `appearance` the alias stood for (`primary` is `tone="accent"`, `ghost` is `appearance="ghost"`, `danger` is `tone="danger"`, `secondary` is the default), and reports what it can't read, such as a `variant` in an object of props. `variant` now only names a variant of the theme.
- **Tones:** `AlertTone`, `BadgeTone` and `ToastTone` of `@panneau/ui` are gone: use `Tone`.
- **Messages:** `@panneau/fields/locales`, `@panneau/forms/locales` and `@panneau/ui/locales` are gone: use `en`, `fr` or `withPanneauMessages()` of `@panneau/intl`, which hold the messages of every package.
- **Pages:** `LinkButton` of `@panneau/app` is gone: use `LinkButton` of `@panneau/ui`, with `tone="accent"` and an icon component (`icon={Plus}`). `back` of `PageHeader` is gone: use `parents={[back]}`.

`@panneau/codemods` has the `button-variants` codemod (`panneau-codemods button-variants <paths>`, or `runCodemods({ codemod: 'button-variants' })`). Inside the packages, every button takes a `tone` and an `appearance`, and a lint rule forbids the aliases.
