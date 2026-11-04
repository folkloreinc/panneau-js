---
'@panneau/protocol': minor
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/intl': minor
'@panneau/codemods': minor
---

Phone extensions ([decision 0058](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0058-phone-extensions.md)).

- **`tel` values can have an extension**, after `;ext=` as in a `tel:` URI: `+15145550199;ext=123`. A number without an extension doesn't change.
- `@panneau/protocol`: the `tel` rule takes `extension: true`, which accepts 1 to 10 digits after `;ext=`; without it, a value with an extension fails. The `tel` type implies `{ rule: 'tel', extension: true }` when `settings.extension` is `true`.
- `@panneau/fields`: `TelField` takes `extension` (`settings.extension`), an input for the digits of the extension after the number. An extension typed or pasted after the number (`ext. 123`, `x123`, `poste 123`) moves to that input when the field is left. `@panneau/fields/tel` exports `splitExtension()`, `joinExtension()`, `readExtension()` and `MAX_EXTENSION_LENGTH`.
- `@panneau/lists`: the `tel` display shows the extension, `+1 514 555 0199, ext. 123`, linked with `tel:+15145550199;ext=123`, when the field allows one.
- `@panneau/intl`: their messages, in English and French.
- `@panneau/codemods`: `TelField` takes `extension`.
- No codemod or Rector rule: a v4 `telephone` field had no extension, and an extension kept in a separate field is merged into the number by a data conversion (`panneau:convert-phones` of `laravel-panneau`), not by rewriting code.
