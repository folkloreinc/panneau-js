# Protocol

Version 1. This document explains the protocol and its conventions. The normative version is the `@panneau/protocol` package ([`packages/protocol`](../packages/protocol)):

- its schemas, in `src/schemas`;
- the files generated from them: `schema/definition.schema.json` and `schema/openapi.json`.

When this document and the package disagree, the package wins.

The protocol is the only contract between a Panneau frontend and its backend. It doesn't assume Laravel, Eloquent or numeric ids. `laravel-panneau` is the reference implementation, and it runs the conformance kit in its CI.

## Principles

- **Plain HTTP and JSON**, with standard verbs (`GET`, `POST`, `PATCH`, `DELETE`). No `_method` override and no form encoding, except for file uploads.
- **Opaque ids.** Item ids are strings. The frontend never parses or generates them. A backend can use numeric ids, UUIDs or prefixed ULIDs.
- **Everything the UI shows comes from the definition or the API.** This covers labels, fields, layouts, abilities and messages. The frontend holds no hidden knowledge about a backend.
- **Additive within a version.** Version 1 of the protocol can gain optional properties and endpoints. Removing or changing the meaning of anything requires version 2 and a major release.

## Definition

`GET {api}/definition` returns the definition for the current user, already translated in the current locale.

```jsonc
{
    "protocol": 1,
    "name": "Mon site",
    "locale": "fr",
    "locales": ["fr", "en"],
    "interfaceLocales": [
        { "locale": "fr", "label": "Français", "url": "/panneau/api/locale/fr" },
        { "locale": "en", "label": "English", "url": "/panneau/api/locale/en" },
    ],
    "api": { "baseUrl": "/panneau/api" },
    "resources": [/* Resource */],
    "pages": { "home": { "component": "dashboard" } },
    "menus": { "main": [{ "type": "resources" }, { "type": "link", "label": "Site", "url": "/" }] },
    "auth": {/* Auth */},
    "dashboard": { "widgets": [/* Widget */] },
    "search": { "enabled": true },
    "theme": { "colorScheme": "auto", "density": "auto", "navigation": "sidebar" }, // density: "compact", "comfortable", "touch" or "auto" (touch on touch screens); navigation: "sidebar" or "dock" (decision 0076)
    "user": { "id": "usr_123", "name": "Ada", "abilities": { "panneau.view": true } },
}
```

- **Languages.** `locales` are the languages of the content, those of localized fields. `interfaceLocales`, optional, are the languages the user can switch the interface to, `locale` among them, each with its `label` in its own language. With two or more, the shell has a language switcher, with the user's settings ([0083](decisions/0083-a-language-switcher-in-the-shell.md)): choosing one is a full navigation to its `url`, with `next` (the path and query of the page), and the backend comes back to it, the definition then in the new locale. `GET /locale/{locale}` is an optional endpoint for that `url`: it redirects to `next`, a local path under the base path, and answers `404` for a locale it doesn't offer.
- **The user's profile.** Without `auth.account`, the user's name links to their item in the resource of users: `user.resource`, or the resource `users` without it. A backend sets `user.resource` to `null` when the user has no item they can edit there, such as a user outside the resource's scope: the app then shows no link to a profile, instead of a page that isn't found.

### Resource

```jsonc
{
    "id": "pages",
    "kind": null, // "media" for a media library
    "label": { "singular": "page", "plural": "pages" },
    "itemStatus": "status", // the state of an item, a badge in relation pickers and cards (decision 0103)
    "open": "edit", // where an item's title goes: "edit" (the default) or "panel"
    "itemActions": ["show", "edit", "duplicate", "delete"], // the built-in item actions shown, the default
    "fields": [ /* Field */ ],
    "form": { "layout": [ /* LayoutNode */ ] },
    "list": {
        "columns": [
            { "field": "title", "sortable": true, "hideable": false },
            { "field": "published_at", "display": "date" },
            { "field": "author", "hidden": true }, // shown when the user chooses it
        ],
        "filters": [ { "id": "status", "type": "select", "options": [...] } ],
        "sorts": [ "title", "-published_at" ],
        "defaultSort": "-published_at",
        "layouts": [ "table", "cards" ],
        "perPage": 20,
        "inlineEdit": [ "title", "status" ],
        "aggregates": { "sum": [ "price" ], "groupBy": [ "status" ], "dates": [ "published_at" ] }
    },
    "summary": { "widgets": [ /* Widget */ ], "list": "collapsed", "period": { "options": ["7d", "30d"] } }, // widgets above the list (decision 0084)
    "actions": [ /* Action */ ],
    "abilities": { "viewAny": true, "create": true },
    "features": { "drafts": false, "revisions": false, "preview": null, "search": true },
    "types": [
        { "id": "home", "label": "Accueil", "fields": [...], "abilities": { "create": false } },
        { "id": "event", "label": "Événement", "description": "Avec une date et un lieu", "fields": [...] }
    ]
}
```

- **`itemTitle`, `itemSubtitle`, `itemImage` and `itemStatus`** name the fields that show an item where it isn't in its list: its title, a line under it, its image ([0061](decisions/0061-item-images-in-lists.md)), and its state. `itemStatus` ([0103](decisions/0103-the-status-of-an-item.md)) names a field whose value says where the item stands (Draft, Archived), usually a `select` whose options have [tones](#tones): relation pickers and cards show the label of its option as a badge in its tone, next to the item's title. A value that isn't one of its options shows as text, in `neutral`; the first value of a `select` with `multiple`. It can name a field of the resource's `types`. Without it, items show no state there. Clients that don't know it ignore it.
- **`types`** ([0077](decisions/0077-resource-types.md)): the types of the items, each with fields of its own (`ResourceType`: `id`, `label`, `description`, `icon`, `fields`, `abilities`). Every item has a `type` among their ids, set when it is created. Its fields are those of the resource, then those of its type, in forms, details and validation; type fields are named apart from the resource's, and none is named `type`. `form.layout` can name the fields of every type: each form leaves out those of the other types.
    - `abilities.create: false` keeps a type out of the choices when creating, and the backend refuses to create one (a singleton such as the home page).
    - To show and filter by type, the backend declares a `select` field `type`, with the types as its options and `notInForm: true`, and a `select` filter `type`.

### Field

```jsonc
{
    "name": "title",
    "type": "text",
    "label": "Titre",
    "help": "Affiché dans les résultats de recherche",
    "default": null,
    "localized": true,
    "rules": [{ "rule": "required" }, { "rule": "max", "value": 120 }],
    "visibleWhen": { "field": "type", "in": ["article"] },
    "readOnly": false,
    "abilities": { "update": false }, // optional: what the current user can do with the field
    "settings": { "placeholder": "…" },
}
```

- **`abilities`** ([0046](decisions/0046-abilities-in-the-ui.md)) say what the current user can do with the field. Only `false` restricts:
    - `view: false`: clients leave the field out of forms, details, list columns, sorts and inline editing. Layouts and columns that name it stay valid. Items don't carry its value.
    - `update: false`: the field is read-only for this user, in forms and in lists. The backend ignores its value on create and update.

    They apply to the fields at the top of a resource and of its types. `readOnly` is for a field that nobody edits.

- **`notInForm: true`** ([0071](decisions/0071-fields-out-of-forms.md)): forms leave the field out, even when their layout names it, and never add it at the end. Items still give its value, which lists, details, item panels and references read: the URL of a page, its `itemSubtitle`. The backend ignores its value on create and update, and lists don't edit it in place. For the fields at the top of a resource and of its types.

- **`type`** names a field type: built-in or provided by a plugin. Built-in types:
    - `text`, `textarea`, `richtext`, `number`, `boolean`;
    - `date`, `datetime`, `time`;
    - `select`, `email`, `url`, `color`;
    - `media`, `image`, `file`, `relation`, `group`, `repeater`, `slug`;
    - `tel`, `range`, `duration`, `json`, `tags`, `embed`, `location` ([0033](decisions/0033-more-field-types.md));
    - `country`, `region` ([0047](decisions/0047-countries-regions-and-phone-numbers.md));
    - `daterange`, `money` ([0053](decisions/0053-date-ranges-and-money.md));
    - `address` ([0054](decisions/0054-addresses.md)) and `link` ([0055](decisions/0055-links.md)).
- **`text` settings:** `prefix` and `suffix` show in the control, around the value. With `"secret": true`, the value is a secret, such as an access key: clients type it in a password input that a button reveals, never let the browser fill it in, and show it as dots in lists and details. The backend still decides whether it sends the value back at all.
- **`select` options** are `{ "value", "label", "description", "disabled", "tone" }`. `tone` colors the option where it shows as a badge, in lists and details: `neutral` (the default), `info`, `success`, `warning`, `danger`, `muted`, or a tone of the theme (`{ "value": "failed", "label": "Failed", "tone": "danger" }`).
    - <a id="tones"></a>**What each tone means**, the same in every admin, so that a user learns the colors once:

        | Tone      | Means                            | Examples                                    |
        | --------- | -------------------------------- | ------------------------------------------- |
        | `neutral` | not started, waiting, a category | Draft, Pending, Idea                        |
        | `info`    | in progress or coming            | In progress, Scheduled, New                 |
        | `success` | done, live, in good shape        | Published, Active, Paid                     |
        | `warning` | needs attention soon             | Expires soon, Low stock, Possible duplicate |
        | `danger`  | a problem to fix now             | Failed, Expired, Overdue                    |
        | `muted`   | over, no longer active           | Closed, Archived, Cancelled, Ended          |

    - `neutral` and `muted` are both quiet, but don't say the same thing: "Draft" hasn't started, "Archived" is done with. `muted` has no fill, only a grey outline, so that what is over steps back from what is still alive. Projects coming from Panneau 4 map Bootstrap's `dark` to `muted`.
    - `accent` is never a state: it is the main action of a screen.
    - Sober by default: most states are `neutral`, and color is for what needs a look. Badges of states use the `subtle` appearance, never `solid`. A state is never shown by its color alone: its word is always there, and the same state has the same short word in every list of an admin. A number (a widget, the count of a group) takes a tone only when it calls for attention (overdue: 3), and stays neutral at 0.
- **`localized`** makes the value an object keyed by locale (`{ "fr": "…", "en": "…" }`). It replaces the separate `localized` field and the `*Localized` PHP classes of v1.
- **`group`** has `fields`, for a nested object.
- **`repeater`** has `fields`, or `types` for typed blocks, for an array. Clients collapse its items under their title; `settings.collapsible: false` keeps them expanded ([0068](decisions/0068-collapsed-items-and-lighter-controls.md)). A repeater can name a list of shared block types with `typeSet`, a key of the definition's `blockTypeSets`, rather than repeat its `types` ([0094](decisions/0094-shared-block-types.md)): the blocks of every type of page, or the blocks a block holds. Clients resolve it into `types` when they read the definition (`validateDefinition()`, `validateBootConfig()`, `resolveBlockTypeSets()`).
- **Compound fields** ([0065](decisions/0065-compound-fields.md)) are types of plugins that carry their sub-fields in `fields` (`credits`, `sessions`). Their value is an object of them, or a list of objects with `"multiple": true`, checked as a `group` or a `repeater`. A client without the type's plugin renders it as a `group`, or as a `repeater` with `multiple` (`getNestedShape()`).
- **`relation`** points to another resource:

    ```jsonc
    { "resource": "authors", "multiple": true }
    ```

- **`slug` values** are strings, or an object per locale when the field is `localized`. `from` names the field the slug follows: in the slug's own locale, or in the default locale for a slug that isn't localized. With `"check": true`, the client checks the slug as it is typed ([Checking a field](#checking-a-field), [0032](decisions/0032-field-checks-and-slugs.md)).
- **`relation` values:**
    - In items, a value is a reference to the related item, `{ "id": "12", "label": "Ada" }`, where `label` is the value of the related resource's `itemTitle`. With `multiple`, it is a list of references. Lists can show related items without fetching them.
    - In requests, the client sends ids: `"12"`, or `["12", "13"]`. A backend also accepts the references it sent, and reads their `id`. It refuses ids that don't exist within the related resource's scope.
- **`media` values** reference media of the libraries the field allows, resources of kind `media` ([Media](#media)). The field's `resource` names one library, or lists several, in the order a picker shows them. Without it, the field allows every library of the definition ([0027](decisions/0027-media-picker.md)).
    - In items, a value is a reference, or a list of them with `multiple`: `{ "id": "med_01H…", "resource": "images", "label": "Portrait", "media": { "type": "image", "thumbnailUrl": "…" }, "transform": { … } }` (`MediaReference`). `resource` is the media's library, `label` its `itemTitle`, `media` what lists and fields show without fetching it, and `transform` the edits of the image for this use only.
    - In requests, the client sends ids (`"med_01H…"`), or `{ "id", "resource", "transform" }`. Ids are unique only within their library, so **a field that allows several libraries needs `resource`** for each media, and the backend refuses an id without it. The backend refuses ids outside the library's scope, as for relations.
- **`image` fields** are `media` fields for images, with an image editor ([0031](decisions/0031-image-editor-and-image-field.md)). Their values, libraries and requests are those of `media` fields, and their `accept` defaults to `["image/*"]`.

    ```jsonc
    {
        "name": "cover",
        "type": "image",
        "ratios": ["16:9", "4:3"], // the ratios the editor suggests
        "rotate": true, // the editor offers rotation and flips (true by default)
        "focalPoint": true, // the editor offers the focal point (true by default)
        "transformBase": "media", // media (the default), original, or choose
        "transforms": true, // values keep a transform for this use (true by default)
        "rules": [{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }],
    }
    ```

    - The `transform` of a value is the edits of the image for this use ([Transform](#media)). `transformBase` sets what it starts from: the media's own transform (`media`), the original file (`original`), or the user's choice in the editor (`choose`).
    - The `crop` rule enforces ratios, and can require a crop for each image.
    - With `"transforms": false`, values keep no transform: the backend ignores the `transform` it receives and items give none, so the field has no editor, and clients send no `transform`. Such a field can't have `ratios` or the `crop` rule. A `media` field can say it too ([0087](decisions/0087-image-fields-without-transforms.md)).

- **`file` values** are files that belong to the item, outside the media library: an attachment, a PDF, a CSV ([0025](decisions/0025-presigned-uploads.md)).
    - In items, a value is a stored file, `{ "name": "terms.pdf", "url": "https://…", "mime": "application/pdf", "size": 52000 }`, or `null`. With `multiple`, it is a list of them.
    - In requests, the client sends `{ "upload": "upl_…" }` for a file uploaded directly to storage, the stored file it received to keep it, or `null` to remove it. Without direct uploads, it sends the file itself, in `multipart/form-data`.
    - `accept` and `maxSize` are checked on the file the backend receives. The client can also send the `name`, `mime` and `size` of an upload next to its `upload`, so that it checks them first.
- **`richtext` values** are HTML ([0007](decisions/0007-rich-text.md)), or `null` when empty. A client keeps the HTML it received until the content is edited: content written by another editor (CKEditor) saves unchanged. Its `settings` (`RichTextSettings`, which `validateDefinition()` checks) set what users can add, not what a value may hold: elements and attributes that the toolbar doesn't offer are kept ([0035](decisions/0035-rich-text-kept-html.md)).

    ```jsonc
    {
        "name": "body",
        "type": "richtext",
        "settings": {
            "toolbar": [
                "heading",
                "style",
                "|",
                "bold",
                "italic",
                "link",
                "bulletList",
                "orderedList",
            ],
            "headings": [2, 3], // the levels the toolbar offers (2, 3 and 4 by default)
            "styles": [{ "label": "Big paragraph", "class": "big", "element": "p" }], // <p class="big">
            "links": { "newTab": "external" }, // choose (the default), external or never
        },
    }
    ```

    - `toolbar` lists buttons in order, with `|` between groups: `heading`, `style`, `bold`, `italic`, `underline`, `strike`, `superscript`, `subscript`, `code`, `link`, `bulletList`, `orderedList`, `blockquote`, `horizontalRule`, `clear`, `undo`, `redo`, and the buttons that plugins add (an inline logo). Clients skip names they don't know.
    - A style in `styles` puts its `class` on an element: `p` (the default), `h1` to `h6`, `blockquote`, `ul`, `ol` or `li`.
    - `links.newTab` sets which links open in a new tab, with `target="_blank" rel="noopener noreferrer"`: as the user chooses, every link to another site, or none.

- **`color` values** are hexadecimal colors, `#1d4ed8`. With `settings.palette`, `[{ "value": "purple", "label": "Purple", "color": "#6b21a8" }]`, a value is the `value` of one of its colors, and a backend refuses others. `color` (hexadecimal) draws the swatch of a color, and `label` names it; without `color`, `value` is a hexadecimal color ([0058](decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
- **`tel` values** are international numbers in E.164, `+15145550199` ([0047](decisions/0047-countries-regions-and-phone-numbers.md)). The type implies the `tel` rule: a client keeps a number that isn't complete as the text typed, which the rule refuses. `settings.country` is the country of a new number. With `settings.extension: true`, a number can have an extension, after `;ext=` as in a `tel:` URI: `+15145550199;ext=123`, 1 to 10 digits, and the type implies `{ "rule": "tel", "extension": true }`, which accepts it ([0057](decisions/0057-phone-extensions.md)).
- **`range` values** are numbers, picked on a slider between the `min` and `max` rules (0 and 100 without them), or `null` until it is moved. Settings `step`, `decimals` and `suffix` are those of `number`.
- **`duration` values** are whole numbers, zero or more, in the unit of the field ([0056](decisions/0056-duration-units.md)). Its settings (`DurationSettings`) take `seconds`, `minutes`, `hours` or `days`, and a day is 24 hours:

    ```jsonc
    {
        "name": "window",
        "type": "duration",
        "settings": {
            "unit": "hours", // the unit of the value: seconds by default; min and max are in it too
            "precision": "hours", // the smallest part the input shows: the unit by default
            "largestUnit": "days", // the largest part the input shows: hours or the precision by default
        },
    }
    ```

    - A precision finer than `unit` is raised to it, and a `largestUnit` smaller than the precision to the precision. Without settings, a value is in seconds, typed in hours, minutes and seconds.
    - The largest part has no upper bound (`100` hours); the others stop where the next unit starts (hours at 23 below days). Lists show the parts with a value, rounded to the precision: `2 d 4 h`.
    - `validateDefinition()` refuses another unit. A backend checks a whole number, zero or more, whatever the unit.

- **`json` values** are objects or arrays, edited as JSON text. The type implies the `json` rule: a client keeps text that doesn't parse as a string, which the rule refuses, and a backend refuses anything but an object, an array or `null`.
- **`tags` values** are lists of strings. `options` suggest tags; with `"settings": { "allowCustom": false }`, only their values are allowed, and `in` applies to each tag. `min` and `max` count the tags.
- **`embed` values** are what a URL embeds: `{ "url", "type", "title", "provider", "thumbnailUrl", "html", "width", "height", "duration" }` (`EmbedValue`), where everything but `url` comes from the provider's oEmbed. `duration` is in seconds, for a video or a sound whose provider gives it (Vimeo's oEmbed does, YouTube's doesn't). `type` is `video`, `audio`, `photo`, `rich` or `link`. Clients get it from `GET /embeds`, and send `{ "url" }` alone without it. The `providers` rule limits the providers: `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }` ([0058](decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
- **`location` values** are a point and its address: `{ "lat", "lng", "address" }` (`LocationValue`), with `lat` from -90 to 90, `lng` from -180 to 180, and `address` optional. Settings `zoom` and `center` (`{ "lat", "lng" }`) frame the map before a point is placed, and `tiles` (`{ "url", "attribution", "maxZoom" }`) replaces the app's tiles.
- **`country` values** are ISO 3166-1 alpha-2 codes in capitals, `CA` (`XK` too). `settings.countries` lists the codes the field allows, `settings.preferred` the ones it shows first. A backend refuses other codes. With `multiple`, a value is an array of distinct codes in the order they were chosen, `["CA", "FR"]`: `min` and `max` count them ([0058](decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
- **`region` values** are states, provinces or territories. Their country is the value of the field that `from` names, in the same object, or `settings.country`. For the countries Panneau knows the regions of, a value is the code of the region without its country, `QC` for `CA-QC`; for the others, the text as typed ([0047](decisions/0047-countries-regions-and-phone-numbers.md)).
- **`address` values** are the parts of a postal address, `{ "street", "unit", "city", "region", "postalCode", "country", "point" }` (`AddressValue`), the empty ones left out ([0054](decisions/0054-addresses.md)). `region` is a value of the `region` type for the address's country, `country` an ISO code, and `point` (`{ "lat", "lng" }`) is there with `settings.point` only. `postalCode` is normalized for its country (`H2X 1Y4`, `12345-6789`). Settings (`AddressSettings`, which `validateDefinition()` checks): `country` (of a new address), `countries`, `preferred`, `required` (the parts a filled address must have, `street`, `city` and `country` by default) and `point`.
    - The type implies the checks of its parts, keyed by their path: `required` on `address.street` for a required part missing from a filled address, `postalCode` on `address.postalCode` for a postal code that isn't one of the address's country.
- **`link` values** are `{ "type", "url", "page", "file", "label", "newTab" }` (`LinkValue`, [0055](decisions/0055-links.md)). `type` is one of the field's types: `url`, `page`, `email`, `tel`, `file`, or a type of the site. `url` is the `href`: `https://…`, `mailto:…`, `tel:+…`, or the text of a type of the site; for `page` and `file` links, the URL the backend resolved, in items only. `page` is a reference to an item of one of the field's `resource` (`{ "id", "resource", "label" }` in items; its id, or `{ "id", "resource" }`, in requests), `file` a media value. `label` is a string per locale, or a string in a `localized` link field. Settings (`LinkSettings`): `types` (built-in names, or `{ "id", "label", "pattern", "placeholder" }` for a type of the site), `newTab` (`choose`, `external` or `never`), `label` (`optional`, `required` or `none`) and `libraries` (of `file` links).

    ```jsonc
    {
        "name": "cta",
        "type": "link",
        "resource": ["pages", "events"], // the resources of page links
        "settings": {
            "types": [
                "page",
                "url",
                "email",
                { "id": "anchor", "label": "Anchor", "pattern": "^#[\\w-]+$" },
            ],
            "newTab": "external", // url and file links open in a new tab
            "label": "required",
        },
    }
    ```

    - The type implies the checks of its parts: `in` on `link.type`; on `link.url`, `url` (an `http` or `https` URL), `email` (`mailto:` and an address), `tel` (`tel:` and E.164), the `pattern` of a type of the site, or `required`; `required` on `link.page`, `link.file`, and `link.label` with `"label": "required"`.
    - A backend sets `newTab` with `external`, and resolves the `url` of `page` and `file` links again: it ignores the one a client sends.

- **`datetime` values** are ISO 8601 date-times. A value with an offset is an instant: clients write it in UTC (`2026-11-04T23:30:00Z`), and show it in `settings.timeZone`, an IANA zone (`America/Toronto`), or in the browser's zone without it. A value without an offset is kept as it is.
- **`daterange` values** are a start and an end, `{ "start", "end" }` (`DateRangeValue`), or `null` ([0053](decisions/0053-date-ranges-and-money.md)). Its `settings` are `DateRangeSettings`, which `validateDefinition()` checks:

    ```jsonc
    {
        "name": "dates",
        "type": "daterange",
        "settings": {
            "time": true, // date-times; days (`2026-11-04`) without it
            "allDay": true, // an "All day" switch: the value has days as bounds, and "allDay": true
            "open": "end", // start, end or both: that bound can be null
            "timeZone": "America/Toronto", // the zone the date-times are shown and typed in
            "chooseTimeZone": true, // a menu of zones, kept in the value as "timeZone"
        },
    }
    ```

    - Days are inclusive: `{ "start": "2026-11-04", "end": "2026-11-06" }` is three days. Date-times have an offset; clients write them in UTC.
    - The zone of date-times is the value's `timeZone`, then `settings.timeZone`, then the browser's.
    - The type implies the `daterange` rule, with the field's `open`: a client keeps a range typed halfway, which the rule refuses.
    - The `date-range` filter on a `daterange` field keeps the items whose range overlaps its days. Lists sort a range by its start.
    - A list of sessions (a range and a venue, repeated) is a `repeater` of a `daterange` and a `relation`.

- **`money` values** are an amount and its currency, `{ "amount": 1250, "currency": "CAD" }` (`MoneyValue`), or `null` ([0053](decisions/0053-date-ranges-and-money.md)).
    - `amount` is an integer in the minor unit of the currency, its ISO 4217 exponent (`getCurrencyDigits()`): `1250` is 12.50 CAD, or 1,250 JPY.
    - `settings.currency` fixes the currency; `settings.currencies` lists those the user picks from, the first one for a new amount; without either, any ISO 4217 currency (`CURRENCY_CODES`). They are `MoneySettings`, which `validateDefinition()` checks.
    - The type implies the `money` rule, with the field's currencies. `min` and `max` apply to the amount, in minor units.
- **`rules`** use the portable rules below. A backend can also enforce rules that it doesn't expose.

### Portable validation rules

| Rule                | Applies to                              |
| ------------------- | --------------------------------------- |
| `required`          | all                                     |
| `min`, `max`        | numbers, amounts; length of text, lists |
| `pattern`           | text                                    |
| `email`, `url`      | text                                    |
| `json`              | `json` values: an object or an array    |
| `tel`               | `tel` values: E.164 (`+15145550199`)    |
| `postalCode`        | postal codes of Canada and the US       |
| `daterange`         | `daterange` values: bounds, end ≥ start |
| `money`             | `money` values: an integer, a currency  |
| `in`                | select values                           |
| `accept`, `maxSize` | files (MIME types, bytes)               |
| `before`, `after`   | dates (value or other field)            |
| `crop`              | `image` and `media` values              |
| `providers`         | `embed` values: their `provider`        |

- **`required`** fails on `null`, an empty or blank string, and an empty array or object. A file chosen in the browser (`File`), to send in `multipart/form-data`, is filled; `accept` and `maxSize` read its type and size.
- **`postalCode`** refuses a postal code that doesn't normalize to the format of its country: Canada (`H2X 1Y4`) and the United States (`12345`, `12345-6789`) for now; others pass ([0054](decisions/0054-addresses.md)). Its `value` is the country, a code (`"CA"`) or another field of the form (`{ "field": "country" }`). The `address` type implies it on its postal code, with its own country.
- **`mode`** limits a rule to one mode of the form: `create` (the item is created) or `update` (it is updated). Without it, a rule applies in both.

    ```jsonc
    // A password: required to create a user, optional to edit one (empty keeps the current one).
    // The backend never sends its value.
    {
        "name": "password",
        "type": "text",
        "settings": { "secret": true },
        "rules": [
            { "rule": "required", "mode": "create" },
            { "rule": "min", "value": 8 },
        ],
    }
    ```

    - Clients check the rule, and show the required mark, in that mode only. `resolveFields()` and `resolveForm()` of `@panneau/core` keep it, without its `mode`, in that mode, and drop it in the other.
    - A backend applies the rule in that mode only. On an update, a field whose `required` is limited to `create` accepts `null`, or no value at all.
    - Rules with a `mode` that a client checks without knowing the mode (`checkRules()` without one) are skipped: the backend still checks them.

- **`providers`** lists the providers an `embed` value may come from, by the `provider_name` of their oEmbed: `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }`. Names are compared without case. A client checks the `provider` of the value that `GET /embeds` gave, and leaves a value without one to the backend. A backend resolves the URL, as when it saves it, and refuses a URL that it can't resolve or whose provider isn't listed.
- **`crop`** checks the transform of each image of a value: `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`.
    - With `required`, each image needs a crop for this use. An id alone has none.
    - With `ratios`, a crop must have one of them once rendered (a quarter turn swaps its width and height). A crop has a ratio when its height is within one pixel of its width divided by the ratio, since crops are in whole pixels.

The frontend checks these rules before sending. The server checks them again, together with server-only rules (uniqueness, existence, business rules).

### Layout

The form layout is a tree that references fields by name. Fields that no layout node references are appended at the end.

```jsonc
[
    { "type": "tabs", "children": [
        { "type": "tab", "label": "Contenu", "children": [
            { "type": "row", "children": [
                { "type": "field", "name": "title", "width": 8 },
                { "type": "field", "name": "status", "width": 4 }
            ] },
            { "type": "field", "name": "body" }
        ] },
        { "type": "tab", "label": "SEO", "children": [ { "type": "section", "label": "Partage", "collapsible": true, "children": [...] } ] }
    ] },
    { "type": "sidebar", "label": "Publication", "children": [ { "type": "field", "name": "published_at" } ] }
]
```

Node types:

- **Containers:**
    - `row`, whose children have `width` on a 12-column grid;
    - `column`, `section`, `tabs` and `tab`, `sidebar`.
    - Each `sidebar` is a panel of the form's aside, next to the form and in view as it scrolls, or below it on narrow screens. Its `label` is the title of the panel, which the user can collapse unless `collapsible: false`; `collapsed: true` starts it collapsed. See [decisions/0074](decisions/0074-asides-next-to-lists-and-forms.md).
    - A `sidebar` with a `panel` is a block of the app or of a plugin, which renders its `children` and takes its `props`: `save` (the state of the form and its Save button), `errors` (the errors after a failed save), `publication` (the state of the publication, with Publish and Unpublish) and `actions` (the actions of the item). `save` and `errors` show beside the form only. A client without the panel renders its children. See [decisions/0075](decisions/0075-panels-of-a-form-sidebar.md).
- **Content:** `field`, `text` (a static help paragraph), `component` (rendered by a plugin, with its `children` rendered: a `component` without its plugin renders its children, [0065](decisions/0065-compound-fields.md)).

Any node can have `visibleWhen`. A field inside a node whose condition is false is hidden, as if it had the condition itself: clients don't show it and don't validate it, and backends don't validate it and don't save its value. The conditions of every node on the way apply, and a field placed more than once applies when one of its places is visible ([decisions/0098](decisions/0098-hidden-layout-nodes-hide-their-fields.md)).

### Actions

An action is an operation applied to one item, a selection, or the whole resource (see [decisions/0017](decisions/0017-actions.md)).

```jsonc
{
    "id": "publish",
    "label": "Publier",
    "icon": "send",
    "kind": "server", // "server" | "link" | "client"
    "scope": ["item", "selection"], // and/or "resource"
    "placement": ["row", "toolbar", "form"],
    "destructive": false,
    "confirm": {
        "title": "Publier les pages",
        "message": "Publier {count, plural, one {# page} other {# pages}} ?",
        "confirmLabel": "Publier",
    },
    "fields": [/* Field */], // parameters, shown in a modal
    "layout": [/* LayoutNode */],
    "queued": false, // true: always answers 202 with a run
    "undoable": false, // true: runs without a confirmation, and its result says how to undo it
    "abilities": { "run": true },
}
```

- **`kind`:**
    - `server` actions call the action endpoint;
    - `link` actions have a `url` template (`/pages/{id}/edit`) or a `route` name from `routes`;
    - `client` actions name a plugin handler in `component`.
- **`scope`:**
    - `item`: one item, from a row or a form;
    - `selection`: the selected items, or every item matching the list query;
    - `resource`: no items, such as import or export of everything.
- **`placement`:** where the action appears.
    - `row`: on each list row;
    - `toolbar`: on the list, for selections and resource actions;
    - `form`: in the header of the item, in its panel and its form;
    - `menu`: in an overflow menu.
- **`confirm`:** `true` uses a default message. Its `message` can use `{count}`.
- **`destructive`:** styles the action and its confirmation as dangerous.
- **`tone`:** the color of the action, a tone of the theme ([decision 0091](decisions/0091-actions-in-their-tones.md)): its icon in rows, its outline in the header of an item. Without it, the built-in actions have theirs (`show` `info`, `edit` `accent`, `restore` `success`), a `link` that leaves the admin is `info`, and the others `neutral`. An action that destroys is always `danger`.
- **`undoable`** ([0063](decisions/0063-undo-instead-of-a-confirmation.md)): the action can be undone, so it runs **without a confirmation**, unless it sets `confirm` itself, and the toast of its result has "Undo" when the result has an `undo` (below). The confirmation comes back above `UNDO_LIMIT` items (100), counted from the selection or the dry run, and for queued runs. Only for an action whose inverse doesn't depend on each item's previous value ("Change the status" of items that each had their own is not undoable).
    - The `delete` of a resource with a trash is declared `{ "id": "delete", "undoable": true }`: it is undone by the built-in `restore`. A resource without a trash keeps the confirmation of the built-in `delete`.
    - Projects declare pairs: archive and unarchive, publish and unpublish. The inverse can appear nowhere (`"placement": []`) and still be run as an undo, by the same abilities.

Built-in actions use reserved ids:

| Id                  | Kind     | Scope               |
| ------------------- | -------- | ------------------- |
| `show`, `edit`      | `link`   | `item`              |
| `duplicate`         | `server` | `item`              |
| `delete`, `restore` | `server` | `item`, `selection` |

`restore` puts deleted items back from the trash of a resource, by their ids: it is the undo of an `undoable` `delete`, and needs no declaration there.
| `export` | `server` | `selection`, `resource` |
| `import` | `server` | `resource` |

**Built-in item actions** ([decisions/0040](decisions/0040-row-links-and-open-mode.md)). `show`, `edit`, `duplicate` and `delete` exist on every resource without being declared. The client shows each one on the items whose abilities allow it; a missing or false ability hides it:

| Action      | Ability     | What it does                                                     |
| ----------- | ----------- | ---------------------------------------------------------------- |
| `show`      | `view`      | links to the item: its form, or its panel with `"open": "panel"` |
| `edit`      | `update`    | links to the item's form                                         |
| `duplicate` | `duplicate` | `POST /resources/{resource}/{id}/duplicate`, then opens the copy |
| `delete`    | `delete`    | the `delete` action, after a confirmation, also on selections    |

- `itemActions` on a resource picks some of them, in its order: `"itemActions": ["edit", "delete"]`. `[]` shows none. Without it, the four are shown.
- A declared action with one of these ids replaces the built-in one (an `edit` with a `url`, a `delete` with its own confirmation), and takes the built-in one's `placement`, `confirm`, `destructive` and `dryRun` when it doesn't set them. It is still shown by the ability above, and only if `itemActions` lists it. Its `label` is optional.
- The id of the action set to `false` hides it too: `{ "update": true, "edit": false }` hides "Edit". An item without abilities shows none of the four.
- A resource that can't duplicate sends `duplicate: false` (or no `duplicate`) on its items.
- Placements: `show` and `edit` in `row` and `form`; `duplicate` and `delete` in `menu` and `form`, and `delete` in `toolbar` for selections. For item actions, `row` is the buttons of a row, `menu` its menu, and `form` the header of the item, in its panel and its form.
- An item shows the same actions in its row, its panel and its form, but the one that leads there: no `show` in the panel, no `edit` in the form.
- **`abilities.run: false`** on an action hides it for the user everywhere. A resource whose user can't delete any of its items declares `{ "id": "delete", "abilities": { "run": false } }`: lists then have no "Delete", and no checkboxes for it ([0046](decisions/0046-abilities-in-the-ui.md)). Lists have checkboxes when a selection action can run.
- The ids `show` and `edit` are only for `link` actions. Every other action needs a `label`. The JSON Schema checks both.
- Other declared actions are for the resource's own operations, and keep their rules: a `link` is shown unless the item says `false`, other actions when the item lists their id.

**What opens an item.** `open` on a resource says where an item's title goes, in its list and wherever the app links to the item ([decisions/0082](decisions/0082-items-open-in-their-form.md)): `edit` (the default), its form; `panel`, the show route with its details next to the list ([decisions/0028](decisions/0028-item-panel.md)), for items read more than edited, or shown with their preview. With `edit`, the show route redirects to the edit route, and `show` is left out. An item without `abilities.update: true` still opens in the panel. Clients treat a value they don't know as `edit`.

**Layouts.** `layouts` lists those a list offers, the first being the default. Clients build in `table`, `cards`, `gallery` and `calendar`, and leave out those they can't show ([decisions/0044](decisions/0044-gallery-and-calendar.md)):

- `gallery` shows the image of each item, its `itemImage` field (a media reference, a media, a file or a URL), and is offered when the resource has one: a media library has one, the `media` of its items. The `table` starts the title of each item with a thumbnail of the same image ([decisions/0061](decisions/0061-item-images-in-lists.md)).
- `calendar` shows the items of a month on the days of a `date`, `datetime` or `daterange` field (a range on each day it covers, [0053](decisions/0053-date-ranges-and-money.md)), set by `calendar`: `{ "field": "starts_at", "filter": "starts_at", "perPage": 100 }`. `filter` is the list's `date-range` filter on that field (the field's name by default), and `perPage` how many items it asks for a month (100 by default). Instead of a page, the calendar asks for the list's query with that filter set to the days around the month, from 6 days before its first day to 6 days after its last, without `page` or `cursor`: `filter[starts_at][from]=2026-10-26&filter[starts_at][to]=2026-12-06&perPage=100`. When the answer has more items than it gives, the calendar says so. A backend needs nothing else.

**Aggregates** ([decisions/0084](decisions/0084-overviews.md)). `aggregates` declares what [`GET /resources/{resource}/aggregate`](#aggregates) can sum and group the items of the list by. Nothing else is aggregated, and a list without it has no aggregates:

- `sum`: fields whose values add up: `number`, `range` and `duration` fields, and `money` fields with one `settings.currency` (amounts of different currencies don't add up);
- `groupBy`: fields whose values the items are grouped by, in a `breakdown`: not the fields whose values are structures (`richtext`, `media`, `image`, `file`, `group`, `repeater`, `json`, `embed`, `location`, `address`, `link`, `daterange`, `money`);
- `dates`: `date` and `datetime` fields whose days, weeks or months the items are grouped by, in a `series`.

`lintDefinition()` checks that each one names a field of the resource, of the right type. A backend leaves out of them the fields the user can't view.

**Columns users choose.** The user of a list shows, hides and orders its columns. A column with `"hidden": true` isn't shown until the user shows it; one with `"hideable": false` is always shown. The chosen columns and the layout are the view of the list: clients keep them in the URL with the query, and may remember them for the user. They are never sent to the backend ([decisions/0042](decisions/0042-list-view-columns-and-remembered-view.md)).

### Pages

`pages` are screens that aren't resources, rendered by a component of a plugin (or the built-in `dashboard`), at `{basePath}/pages/{page}`:

```jsonc
"pages": {
    "home": { "component": "dashboard" }, // the home route
    "activity": { "component": "dashboard", "label": "Activity", "widgets": [ … ] }, // a dashboard page
    "usage": { "component": "usage", "label": "Usage", "props": { "period": "month" } },
    "job": { "component": "job", "label": "Job", "params": ["id"], "parent": { "resource": "jobs" } }, // {basePath}/pages/job/{id}
}
```

- The component gets the page's `props`, the definition, and `params`: the values of the path segments that `params` names ([decisions/0038](decisions/0038-pages-with-params.md)). A page takes exactly its params.
- A route reference can name a page: `{ "route": "job", "params": { "id": "4f2a" } }`, when `routes` has no route of that name. Menus don't link to pages with params.
- **`parent`** ([0093](decisions/0093-breadcrumbs-in-the-page-header.md)): what the page belongs to, another page (`"parent": "activity"`) or the list of a resource (`"parent": { "resource": "jobs" }`). A resource can name a page as its `parent` too, such as the dashboard page that a log is reached from. Clients show the parents above the title of the page, and keep the nearest one in the menus current when the page or the resource isn't there. `lintDefinition()` checks that a parent exists, isn't `home` nor a page with `params`, and that no chain comes back to where it started.
- **`abilities`** ([0046](decisions/0046-abilities-in-the-ui.md)): `{ "view": false }` leaves the page out of menus, and its route shows a forbidden state. `pages.home` with `view: false` falls back to the built-in home. Without it, a page is allowed. A backend can also leave out a page the user should not know about.

### Dashboard

A page whose component is the built-in `dashboard` is a dashboard: its `widgets`, the user's, in order ([decisions/0064](decisions/0064-dashboard-widgets.md), [0084](decisions/0084-overviews.md)). Only a `dashboard` page has `widgets`. With `pages.home` set to the built-in `dashboard`, the home page is the widgets of `pages.home.widgets`, or of `dashboard.widgets`, its shorthand, which existing definitions use:

```jsonc
"dashboard": {
    "widgets": [
        // On a resource: the client reads its list, with this query
        { "id": "to-judge", "type": "stat", "label": "Entries to judge",
          "settings": { "resource": "entries", "query": { "filter[status]": "to-judge" } } },
        { "id": "latest", "type": "list", "label": "Latest entries", "width": 4,
          "settings": { "resource": "entries", "query": { "sort": "-created_at" } } },
        // On the aggregates of a resource: the client reads GET /resources/{resource}/aggregate
        { "id": "fees", "type": "stat", "label": "Entry fees",
          "settings": { "resource": "entries", "measure": "sum:fee", "target": 100000 } },
        { "id": "submitted", "type": "series", "label": "Entries per day",
          "settings": { "resource": "entries", "group": "day:created_at" } },
        { "id": "by-status", "type": "breakdown", "label": "Entries by status",
          "settings": { "resource": "entries", "group": "status" } },
        // Combined (decision 0089): a number, its change, its trend and its parts in one card
        { "id": "fees-metric", "type": "metric", "label": "Entry fees",
          "settings": { "resource": "entries", "measure": "sum:fee", "points": "day:created_at",
                        "by": "status", "goodWhen": "up" } },
        // A row per subject: its count, its change, its failures, its trend
        { "id": "activity", "type": "table", "label": "Activity", "width": 12,
          "settings": { "points": "day:created_at", "rows": [
              { "resource": "emails", "label": "Emails",
                "alert": { "query": { "filter[status]": "failed" }, "label": "failed" } },
              { "resource": "entries", "label": "Fees", "measure": "sum:fee" } ] } },
        // Data of its own, from GET /dashboard/widgets/{widget}
        { "id": "per-day", "type": "series", "label": "Entries per day", "width": 8 },
        { "id": "storage", "type": "metric", "label": "Storage",
          "settings": { "format": { "style": "unit", "unit": "megabyte" }, "hideEmpty": true } },
        { "id": "weather", "type": "weather", "settings": { "city": "Montréal" } } // a plugin's
    ]
}
```

- **Dashboard pages.** `pages.activity = { "component": "dashboard", "label": "Activity", "widgets": [ … ] }` is a page of widgets at `{basePath}/pages/activity`, with its label above them, and that menus link to as to any page (`{ "type": "page", "page": "activity" }`). Its widgets have the same types, layout, states and checks as those of the home page. Without widgets, it says it has none. The home page keeps the welcome above its widgets, and the cards of the resources without any. Set the widgets of the home page in `pages.home.widgets` or in `dashboard.widgets`, not both. `getDashboardWidgets(definition, page)` of `@panneau/protocol/runtime` reads the widgets of a page.
- **Types.** `stat`, `series`, `list`, `breakdown`, `metric` and `table` are built in. Any other type is a widget of a plugin, drawn by its component from the data of the endpoint, with its own `settings`.
- **`width`**: the columns of a grid of 12, 3 for a `stat`, 4 for a `metric` and 6 for the others by default. One column on a phone.
- **On a resource.** A `stat` or a `list` with `settings.resource` reads the list of that resource, with `settings.query` written as its query parameters: a `stat` reads `perPage=1` and shows `meta.total`, a `list` reads `perPage=5` and shows the title of each item (`itemTitle`) and the badge of its value of the first `select` column. Both link to the list with that query. The resource must exist, the filters of `query` must be filters of its list, and `query` leaves out `page`, `perPage` and `cursor`. A list paged with cursors has no total: it can't feed a `stat` that counts.
- **On the aggregates of a resource** ([decisions/0084](decisions/0084-overviews.md)). A `series`, a `breakdown`, and a `stat` whose `settings.measure` is a `sum:`, read [`GET /resources/{resource}/aggregate`](#aggregates) instead, with the filters and the search of `settings.query`, its `measure` (`settings.measure`, `count` by default), and for a `series` and a `breakdown`, its `group` (`settings.group`). The answer has the shape of the widget. A `stat` that counts (no `measure`, or `count`) keeps reading `meta.total` of the list.
    - A `series` needs a `group` on a period of a field of `dates` (`day:created_at`), a `breakdown` a field of `groupBy`, and a `sum:` a field of `sum`, in the aggregates of the list. A `list` has no `measure` or `group`. `lintDefinition()` checks them.
    - A `stat` links to the list with its query. Each bar of a `breakdown` links to the list filtered by its value (`key`), when the list has a filter whose id is the field; a breakdown of a `select` takes the labels and the tones of its options.
    - A sum of `money` is shown in its currency.
    - `settings.target` gives a `stat` on a resource its `target`, in the unit of its value: minor units for a sum of `money`.
- **Combined widgets** ([decisions/0089](decisions/0089-combined-widgets.md)) answer several questions in one card, from several reads of the aggregates, with no code:
    - a `metric` on a resource (`settings.resource`, `query`, `measure`) reads its value, its trend with `settings.points` (`day:created_at`), its parts with `settings.by` (a field of `groupBy`), and with a period it follows (`settings.period`), its value over the previous range (`getPreviousRange()`);
    - a `series` with `settings.split` (a field of `groupBy` the list filters by, with `settings.resource` and a `group` on a period) draws a line for each of the 5 largest values of the field, filtered by it, and the rest as "Other"; a `series` with `settings.sources` (without `resource`) draws a line per source, at most 5: `{ "resource", "label", "query", "measure", "group", "period", "help", "tone", "alert": { "query", "label", "tone" } }`, whose `group` and `period` default to the widget's; `settings.stacked: true` stacks the lines as areas;
    - a `table` with `settings.rows` (at most 8): `{ "resource", "label", "query", "measure", "points", "period", "alert" }`, each row a count or a sum over the period, with its change from the previous range, its alert, and its trend (`points`, `settings.points` by default).
    - An `alert` counts the items of its source, with its `query` on top, over the same period: "4 failed" in its `tone` (`danger` by default) when there are some.
    - `getWidgetAggregates()` lists the reads of a combined widget, and the caps keep them bounded: 4 for a `metric`, 7 for a `split`, 10 for `sources`, 32 for `rows`. `lintDefinition()` checks their resources, aggregates, filters and periods, and that the lines of a series share one period.
- **How numbers are drawn** ([decisions/0089](decisions/0089-combined-widgets.md)), for the built-in types:
    - `settings.format`: options of `Intl.NumberFormat` (`style`: `decimal`, `percent`, `currency` with `currency`, `unit` with `unit`; `currencyDisplay`, `unitDisplay`, `minimumFractionDigits`, `maximumFractionDigits`, `notation`, `signDisplay`), over the `format` of the data, key by key. `{ "style": "unit", "unit": "megabyte" }` writes `1,530.3 MB`. Without a format, a sum of `money` on a resource is written in its currency;
    - `settings.goodWhen` (`up` or `down`), on a `metric` or a `table`: a change that way is `success`, the other way `danger`; neutral without it;
    - `settings.hideEmpty: true` hides a widget whose data has nothing to show, as a `403` does: a value of 0 (a `metric` at 0 that was 0), points all at 0, no items, no rows (`isWidgetDataEmpty()`).
- **Data.** The other widgets get theirs from `GET /dashboard/widgets/{widget}?page={page}`, in the shape of their type, as is. `page` is the id of their page in `pages`: without it, it means `home`, and the widgets of the home page are asked for without it. Texts are translated by the backend:

| Type        | Data                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stat`      | `{ "value": 12, "help": "3 more than last week", "tone": "warning", "url": "…", "target": 20 }`: `value` only is required. `tone` only when the number calls for attention. `target`, above 0, draws a meter under the number: past it, the meter takes `tone`, or `danger`                                                                                                                                                                                                 |
| `series`    | `{ "period": "day", "points": [{ "date": "2026-10-05", "value": 4 }], "total": 12 }`: `period` is `day`, `week` or `month`, each `date` the first day of its period, going up                                                                                                                                                                                                                                                                                               |
| `list`      | `{ "items": [{ "title": "…", "description": null, "meta": "12 answers", "url": "…", "badge": { "label": "Open", "tone": "success" } }], "empty": "…", "url": "…" }`: at most 5 items, the most useful first                                                                                                                                                                                                                                                                 |
| `breakdown` | `{ "items": [{ "label": "Failed", "value": 3, "tone": "danger", "url": "…" }], "total": 42, "other": 5 }`: the parts of a total, at most 10, drawn as horizontal bars, the largest first, and the rest, `other`, last as "Other". An item of the aggregate endpoint also has its `key`                                                                                                                                                                                      |
| `metric`    | `{ "value": 40, "previous": 32, "help": "…", "tone": "…", "url": "…", "target": 50, "points": [{ "date": "2026-10-05", "value": 4 }], "period": "day", "parts": [{ "label": "Failed", "value": 3, "tone": "danger", "url": "…" }], "other": 1 }`: `value` only is required. The change from `previous` is written under the number; `previous` is the value over `getPreviousRange()` of the period the widget gets. `points` draw a small line, the 5 largest `parts` bars |
| `table`     | `{ "columns": [{ "key": "cost", "label": "Cost", "align": "end", "format": { … } }], "rows": [{ "label": "Summaries", "url": "…", "cells": { "cost": 9.08, "calls": { "value": 6, "tone": "danger", "help": "failed" } }, "points": [ … ] }], "period": "day", "empty": "…", "url": "…" }`: at most 6 columns, unique keys, and 8 rows. A cell is a number, `null` ("—"), or a number with a tone, a word after it and a `format`                                           |

A `series` can have several lines: `series: [{ "key": …, "label": "Emails", "points": [ … ], "total": 32, "tone": "…", "url": "…", "help": "…", "alert": { "value": 4, "label": "failed", "tone": "danger" } }]`, at most 6, drawn as one chart with a legend instead of `points`, which stays required: their total per period, or `[]`. The data of every built-in type but `list` can have a `format`.

- **Errors.** A widget that isn't on that page of the user's (an unknown page, a page that isn't a dashboard, or the widget of another page), or a widget that reads resources (`readsResources()`), is a `404`. A `403` hides the widget. Data that doesn't have the shape of its type is a `500` problem: clients show the widget's error, with a retry, and the other widgets stay. `checkWidgetData()` of `@panneau/protocol/runtime` checks a shape and names the wrong keys.

### Summary

A resource can have a **summary**: widgets drawn above its list, between the header of the list page and the list, in the grid of a dashboard ([decisions/0084](decisions/0084-overviews.md)). Its widgets have the types, layout, states and checks of those of a dashboard, at `resources.<i>.summary.widgets.<j>`:

```jsonc
"summary": {
    "widgets": [
        // On the resource: they follow the list
        { "id": "failed", "type": "stat", "label": "Failed",
          "settings": { "resource": "emails", "query": { "filter[status]": "failed" } } },
        { "id": "per-day", "type": "series", "label": "Emails per day",
          "settings": { "resource": "emails", "group": "day:sent_at" } },
        // The whole resource, whatever the list shows
        { "id": "all", "type": "stat", "label": "All emails",
          "settings": { "resource": "emails", "followsList": false } },
        // Data of its own, from GET /dashboard/widgets/{widget}?resource=emails
        { "id": "bounces", "type": "stat", "label": "Bounce rate" }
    ],
    "list": "collapsed" // optional: the resource opens on its summary
}
```

- **It follows the list.** The widgets on the resource of the summary get the list's current filters and search, so filtering the list redraws them. The filters of their own `settings.query` stay theirs: on the same filter, the widget's value wins, so a stat of the failed items stays one. A widget keeps the whole resource with `settings.followsList: false`. A widget on another resource doesn't follow the list. `followsList` is only for the widgets of a summary, and `lintDefinition()` checks it. A widget on a resource names it in `settings.resource`, as on a dashboard: without it, a built-in widget has data of its own.
- **Data of its own.** A widget with data of its own gets it from `GET /dashboard/widgets/{widget}?resource={resource}`, with the filters and the search of the list (`filter[…]`, `q`) as the list sends them, unless it has `settings.followsList: false`. The request never has the sort or the paging of the list: `page` is the page of a dashboard, and `page` and `resource` together are a `422`. A widget that isn't in the summary of that resource for the user is a `404`, and the summary of a resource the user can't list (`viewAny: false`) a `403`. `toWidgetDataParams()` and `readWidgetDataQuery()` of `@panneau/protocol/runtime` write and read these parameters.
- **Collapsible.** The user hides or shows the summary, and the browser remembers it per resource.
- **The list can come second.** With `"list": "collapsed"`, the resource opens on its summary, its list folded under it behind "Show the N items" (its `meta.total`). A URL that asks for some items (filters, a search, a page or a sort, as the links of the widgets give), or an item, shows the list at once, and so does hiding the summary.

### Period

A dashboard page or a summary can declare one **period** for its widgets ([decisions/0084](decisions/0084-overviews.md)): `pages.<id>.period` on a page whose component is the built-in `dashboard`, `pages.home.period` or `dashboard.period` for the home page (not both), and `summary.period`:

```jsonc
"period": { "options": ["7d", "30d", "90d", "month", "year"], "default": "30d" }
```

- **Options.** `options` lists the periods the user chooses from, in order, each once; `default`, among them, is the one the overview opens on (the first option without it). A segmented control in the header of the dashboard page or of the summary chooses it, and the URL keeps it: `?period=90d`. An option that the overview doesn't offer is its default.
- **Days.** A period is a range of days, both inclusive, ending today, in the time zone of the browser:
    - `7d`, `30d` and `90d`: the 7, 30 or 90 days ending today, today included (on 2026-11-17, `7d` is 2026-11-11 to 2026-11-17);
    - `month`: the current calendar month, from its first day to today (2026-11-01 to 2026-11-17);
    - `year`: the last 12 months, the current month and the 11 before it, from the first day of the month 11 months ago to today (2025-12-01 to 2026-11-17).

    `getPeriodRange(option, today)` of `@panneau/protocol/runtime` computes them.

- **Widgets on a resource** follow the period when `settings.period` names a `date-range` filter of the list of their resource (`"period": "created_at"`): the client sets that filter to the days of the period, `filter[created_at][from]=…&filter[created_at][to]=…`, in its request and its links. The backend needs nothing new. A widget on a resource without `settings.period` doesn't follow the period, except in a summary (below).
- **The previous range**, which a `metric` and a `table` compare with ([decisions/0089](decisions/0089-combined-widgets.md)): the same number of days just before, for `7d`, `30d` and `90d`; the same days of the month before for `month`, to its last day when it is shorter; the same days a year before for `year` (`getPreviousRange(range, option)`). A widget with data of its own computes its `previous` over it.
- **Widgets with data of their own** get the period from `GET /dashboard/widgets/{widget}` as `period[option]`, `period[from]` and `period[to]`: `?page=activity&period[option]=30d&period[from]=2026-10-19&period[to]=2026-11-17`. A widget that doesn't follow the period says so with `settings.period: false`, and gets none. A period whose option isn't one of the five, whose days are missing or aren't days, or whose `from` is after `to`, is a `422` with `errors` keyed by `period`. The option is `period[option]`, not `period` itself, so that the three parameters read as one object in every backend: PHP drops `period=30d` next to `period[from]`.
- **On a summary**, the period is the list's own `date-range` filter: `summary.period.filter`, or the first `date-range` filter of the list, which it needs. Choosing a period sets that filter, so it filters the rows too, and the widgets that follow the list. The URL keeps the option and the days: `?period=30d&filter[sent_at][from]=…&filter[sent_at][to]=…`, and the days are those of today when the page opens with an option. A range set otherwise (a link, the list's own filter) stays: the option with those days is chosen, or none, and the widgets with data of their own then get no `period` parameters, only the filters of the list.
- **What it changes.** The widgets on a resource with `settings.period`, the widgets with data of their own without `settings.period: false`, and in a summary the widgets that follow the list. When some widgets don't follow it, the control lists those it changes. `followsPeriod(widget, summaryResource)` of `@panneau/protocol/runtime` says whether a widget does.
- `lintDefinition()` checks the options and the default, a period only on a `dashboard` page, the filter of a summary, and that `settings.period` names a `date-range` filter of the list of a widget on a resource (without a resource, it can only be `false`), in an overview with a period.

### Menus and the forbidden state

- **Menus** show an entry when the user can reach its target: a resource with `viewAny`, a page without `view: false`. Groups left empty and extra separators are left out. A `link` entry has no abilities: a backend leaves it out of the definition of a user who can't follow it.
- **Collapsible groups and emphasized entries** ([0079](decisions/0079-collapsible-groups-and-emphasized-entries.md)): a `group` with a label and `"collapsible": true` can be shown or hidden by the user, who the browser remembers; `"collapsed": true` starts it closed, unless it holds the current page. `"emphasis": true` on a `resource`, `page` or `link` shows its label in bold.
- **The forbidden state** ([0046](decisions/0046-abilities-in-the-ui.md)) is a page of the app, in the shell, with a link to the home page. It shows on the list and show routes of a resource without `viewAny`, the create route of a resource without `create`, the route of a page with `view: false`, and when the request of a page answers `403`. The edit route of an item without `update: true` goes to its show route, or shows the forbidden state when the item can't be viewed either. `401` still goes to the login.

### Context

`context` declares a current context that the user picks in the app, such as a client and a contest ([decisions/0045](decisions/0045-current-context.md)). The client sends its values with every request, and the definition is built for them:

```jsonc
"context": {
    "params": [
        { "name": "client", "label": "Client", "fixed": true, "value": "4", "valueLabel": "Northwind" },
        { "name": "contest", "label": "Contest", "required": true, "value": null },
    ],
}
```

- Params are in order: each one depends on those before it. `name` is an identifier that isn't a reserved first segment of the client routes (`resources`, `pages`, `media`, `search`, `account`, `auth`).
- The choices of a param are its `options`, or `GET /context/{name}/options?q=…` (see [Context header](#context-header)).
- `value` and `valueLabel` say what the definition was built for. A required param without a value has the app show a page to pick it.
- A `fixed` param has a value that the backend sets from the request, such as its domain (the client of a client's domain): the app shows it without a field, and leaves it out of the path and of the header. Elsewhere, the same param can be picked, with an `allLabel` when it is optional.
- In the app, the values of the params that aren't fixed are a prefix of the client routes: `{basePath}/{name}/{value}/…`, in order.

### Auth

```jsonc
{
    "mode": "panneau", // "panneau": Panneau's own pages; "external": the site handles login
    "loginUrl": null, // with "external", where to send unauthenticated users
    "logoutUrl": null, // with "external", the site's logout, where the browser goes to log out
    "password": true, // an email and a password; the default without "token"
    "token": { "label": "Admin token", "help": "…" }, // optional: a login with a single secret
    "providers": [{ "id": "google", "label": "Google", "url": "/panneau/auth/google" }],
    "passwordReset": true,
    "twoFactor": true,
    "passkeys": true,
    "emailVerification": false,
}
```

- **Login.** In `panneau` mode, the app shows its login page when the API answers `401`: a form for an email and a password, a form for the secret of `token`, and a link for each provider, as `auth` says. `POST /auth/login` takes `{ "email", "password", "remember" }`, or `{ "token", "remember" }` with `token`. See [decisions/0037](decisions/0037-login-page-token-and-logout.md).
- **Logout.** In `panneau` mode, the app calls `POST /auth/logout`, then shows the login page. In `external` mode, the browser goes to `logoutUrl`; without it, the app offers no logout.
- **Password reset.** With `passwordReset`, the login page links to a form that calls `POST /auth/password/forgot` with `{ "email" }`. The backend answers `204` whether or not the address has an account, and emails a link to the page of the app at `{basePath}/auth/reset-password?token=…&email=…` (`AUTH_PAGE_PATHS.resetPassword`). That page sends `{ "token", "email", "password" }` to `POST /auth/password/reset`, then shows the login page: the reset doesn't log in. See [decisions/0048](decisions/0048-password-reset-and-email-verification.md).
- **Two-factor authentication.** With `twoFactor`, `POST /auth/login` answers `202` with `{ "twoFactor": true }` for a user who has it: the login page asks for a code of the authenticator app, or a recovery code, and sends `{ "code" }` or `{ "recoveryCode" }` to `POST /auth/two-factor/challenge`. Users set it up through `/account/two-factor` (status, setup with a secret and a QR code shown as an image, confirmation with a code that gives the recovery codes, new codes, turning it off). A user who must have it and hasn't set it up gets a `403` problem of type `urn:panneau:problem:two-factor-required` (`TWO_FACTOR_REQUIRED_PROBLEM_TYPE`) on every operation but those of the auth and of `/account/two-factor`, and the app shows the setup. See [decisions/0049](decisions/0049-two-factor-authentication.md).
- **Account page.** With `account`, the user's name in the sidebar links to `{basePath}/account`: their name and email (`GET` and `PATCH /account`), their password (`PUT /account/password` with `{ "currentPassword", "password" }`), and their two-factor authentication. See [decisions/0050](decisions/0050-account-page.md).
- **OAuth providers.** Each provider with a `url` is a link of the login page, a full navigation, with `next` (the path and query of the page). The backend's callback goes to `next`, or comes back to the base path with `authError` (`AUTH_ERROR_PARAM`): `provider`, `email`, `domain` or `access` (`AUTH_ERROR_CODES`), which the login page says. See [decisions/0052](decisions/0052-oauth-providers.md).
- **Passkeys.** With `passkeys`, the login page has a passkey button: `POST /auth/passkeys/options` gives the options of `navigator.credentials.get()`, and `POST /auth/passkeys/login` sends `{ "credential" }`, in the JSON form of the WebAuthn spec. The account page lists, adds and removes the user's passkeys (`/account/passkeys`). See [decisions/0051](decisions/0051-passkeys.md).
- **Password confirmation.** An operation that needs a recent password answers `423`, a problem of type `urn:panneau:problem:password-confirmation`: the app asks for the password, sends it to `POST /auth/password/confirm`, and runs the operation again.
- **Email verification.** With `emailVerification`, the backend answers a user whose address isn't verified with a `403` problem of type `urn:panneau:problem:email-unverified` (`EMAIL_UNVERIFIED_PROBLEM_TYPE`) on every operation but those of the auth. The app then shows a page that sends a new link (`POST /auth/email/verification`). The link opens the page of the app at `{basePath}/auth/verify-email?token=…` (`AUTH_PAGE_PATHS.verifyEmail`), which sends `{ "token" }` to `POST /auth/email/verify`, logged in or not.

## Boot config

The page of the app carries a **boot config**: what the app needs before it can call the API. The server writes it as JSON in an element with the id `panneau-boot` (`BOOT_CONFIG_ELEMENT_ID`), next to the root element of the app:

```html
<div id="panneau"></div>
<script type="application/json" id="panneau-boot">
    { "protocol": 1, "apiBaseUrl": "/panneau/api", "basePath": "/panneau", "locale": "fr" }
</script>
```

```jsonc
{
    "protocol": 1,
    "apiBaseUrl": "/panneau/api", // the app fetches {apiBaseUrl}/definition, and makes every call there
    "basePath": "/panneau", // path of the app; client routes are under it ("/" on its own domain)
    "locale": "fr", // locale of the UI before the definition loads
    "definition": {/* Definition */}, // optional: inlined for the first render
    "loginUrl": "/login", // optional: where to send users when GET /definition answers 401
    "auth": {/* Auth */}, // optional: the auth of the definition, for the login page before it
}
```

- **`definition`** is the response of `GET /definition` for the current user ([decisions/0004](decisions/0004-definitions-are-data.md)). With it, the app skips that request on load.
- **`loginUrl`** is only used before the definition is known. Afterwards, the app uses `auth.loginUrl` of the definition.
- **`auth`** is the `auth` of the definition. In `panneau` mode, the app's login page shows before the definition can be loaded, and reads which logins to offer from it. The server serves the page to guests, rather than redirecting them.
- **Escaping.** The server escapes `<`, `>` and `&` in the JSON, so its content can't close the `<script>` element.
- Like the definition, the boot config keeps properties it doesn't know.

`validateBootConfig()` checks a boot config, including the references of its inlined definition. `@panneau/protocol/boot.schema.json` is its JSON Schema, for backends in other languages. The client routes under `basePath` and the handling of `401` are part of the app's entry contract: see [decisions/0019](decisions/0019-app-entry.md).

## HTTP API

All paths are relative to `api.baseUrl`.

### Resources

| Operation   | Request                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List        | `GET /resources/{resource}`                                                                                                                                       |
| Show        | `GET /resources/{resource}/{id}`                                                                                                                                  |
| Create      | `POST /resources/{resource}`                                                                                                                                      |
| Update      | `PATCH /resources/{resource}/{id}` (partial, with `If-Match`)                                                                                                     |
| Delete      | `DELETE /resources/{resource}/{id}`                                                                                                                               |
| Duplicate   | `POST /resources/{resource}/{id}/duplicate`: `201` with the copy (`{ "data": Item }`), for `abilities.duplicate`; `409` when the copy conflicts with another item |
| Action      | `POST /resources/{resource}/actions/{action}` (see [Actions](#actions-1))                                                                                         |
| Inline edit | `PATCH /resources/{resource}/{id}` with a single field                                                                                                            |
| Check       | `POST /resources/{resource}/fields/{field}/check` (see [Checking a field](#checking-a-field))                                                                     |
| Aggregate   | `GET /resources/{resource}/aggregate` (see [Aggregates](#aggregates))                                                                                             |

**List query parameters:**

- `page`, `perPage`: at most 100 items a page (`MAX_PER_PAGE`); a backend caps a larger `perPage` there, and says it in `meta.perPage`
- `cursor`: for a list whose `pagination` is `cursor`, the `nextCursor` (or `previousCursor`) of a page, instead of `page` ([0039](decisions/0039-cursor-pagination.md))
- `sort=-published_at,title`: comma-separated, `-` for descending
- `filter[{id}]`: the value of a filter of the list's definition, keyed by its `id`:
    - one value: `filter[status]=published`;
    - any of several values: `filter[tags][]=a&filter[tags][]=b`;
    - the bounds of a range filter (`date-range`): `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`. Both bounds are inclusive, and either can be left out for an open end. A `date-range` has days as bounds (`YYYY-MM-DD`): `to` includes the whole day, so a date-time on `2026-01-31` is in the range above.

    - the ids of items, a filter of every list that no definition declares: `filter[ids][]=12&filter[ids][]=13`. It lists those items only, at most 100, with the other filters, the search and the sort; ids the backend doesn't find, or that the user can't see, are left out. `ids` is reserved: a definition can't declare a filter with that id ([0069](decisions/0069-show-the-items-an-action-changed.md)).

    A backend ignores the filters it doesn't declare, but `ids`. In an action's query selection, the same values are JSON: `"filter": { "published_at": { "from": "2026-01-01" } }`.

- `q`: search
- `fields=title,status`: the fields to give the values of, so lists ask for the fields they show (their columns, the title and the image of items, the field of the calendar). Items still have their `id`, `version`, `abilities`, their `type` ([0077](decisions/0077-resource-types.md)) and, in a media library, `media`. A backend can also give the values of the resource's `itemTitle` and `itemImage` fields, which lists show. Without it, items have every field. Clients get by with a backend that ignores it.

#### Aggregates

`GET /resources/{resource}/aggregate` counts or sums the items of a list that declares `list.aggregates`, grouped by a period or a field, and answers in the shape of a widget ([decisions/0084](decisions/0084-overviews.md)). It counts the items the user can list, through the same policies and scope as the list: a resource without `viewAny` is a `403`, and a resource without aggregates a `404`. (`aggregate` is a path segment of its own: a backend routes it before `{id}`.)

- **Parameters:**
    - the filters (`filter[{id}]`) and the search (`q`) of the list, read as the list reads them; `page`, `perPage`, `cursor`, `sort` and `fields` are ignored;
    - `measure`: `count` (the default), or `sum:{field}` of a field of `sum`. A sum of `money` adds the amounts, in minor units;
    - `group` (optional): `{period}:{field}`, where the period is `day`, `week` or `month` and the field is in `dates`, or a field of `groupBy`.

    A measure or a group in another format, or that names a field the aggregates don't declare, is a `422` problem, with `errors` keyed by `measure` or `group`.

- **Limits.** A backend can refuse an aggregate it would compute over too many items, such as one it can't compute in its database: a `422` problem, with the message keyed by `measure` or `group`, which the client shows; the user narrows the filters. It can also limit how often a user asks for aggregates: a `429`, with `Retry-After` in seconds.

- **Without a group,** a `stat`: `{ "value": 12 }`.
- **By a period,** a `series`: `{ "period": "day", "points": [{ "date": "2026-10-05", "value": 4 }], "total": 12 }`.
    - One point per period, at 0 when it has no items, each `date` the first day of its period: the day, the Monday of the week (ISO 8601), the first day of the month.
    - The day of a value is its date as the backend writes it, as the bounds of a `date-range` filter read it (`2026-10-05T23:30:00-04:00` is on `2026-10-05`). Items without a date are left out.
    - The points go from the period of the `from` bound to the period of the `to` bound of the `date-range` filter whose id is the date field, when the query has them. Without a bound, they start on the period of the first item, or end on the period of the last; without items or bounds, there are none.
    - At most 366 points: a longer range keeps the latest.
    - `total` is the sum of the points.
- **By a field,** a `breakdown`: `{ "items": [{ "key": "failed", "label": "Failed", "value": 3, "tone": "danger" }], "total": 42, "other": 5 }`.
    - A part per value, the largest first (equal parts in the order of the options of a `select`), at most 10: the sum of the others is `other`, left out when there are none.
    - `key` is the value, as the list filters by it: the `id` of a `relation`, `null` for the items without a value, labeled by the backend ("None").
    - `label` is the label of the value, translated: the label of its option for a `select`, with its `tone`, the `label` of a reference for a `relation`.
    - An item with several values (`multiple`, `tags`) counts in the part of each one. `total` is the measure of all the items, each counted once.
- **Reference.** `readAggregateQuery()` of `@panneau/protocol/runtime` reads and validates the parameters, `aggregateItems()` computes the answer over items a list query filtered, and `toAggregateParams()` writes the parameters. The mock backend answers with them.

#### Checking a field

A field with `"check": true`, at the top of a resource or of one of its types, checks its value with the backend as it is typed (debounced), and once when the form opens ([0032](decisions/0032-field-checks-and-slugs.md)):

```jsonc
// POST /resources/pages/fields/slug/check
{ "value": "ete-a-montreal", "locale": "fr", "id": "12", "values": { "parent": "7" } }
// 200
{
    "available": false,
    "suggestion": "ete-a-montreal-2",
    "prefix": "https://example.com/fr/vacances/",
    "url": "https://example.com/fr/vacances/ete-a-montreal"
}
```

- `id` is the item being edited, or null when creating. `values` are the form's current values, as they would be sent to save, for what the answer depends on (a page's parent).
- `available` says whether another item of the resource, in its scope and the same locale, has the value. `suggestion` is a free value close to it when it is taken: the field offers it, without replacing what was typed.
- `prefix` and `url` are what the field shows in front of the value and as a link, or null. `disabled: true` says the field doesn't apply to this item (the home page has no slug): the field is read-only.
- The check runs with the user's permission to create, or to update the item `id`. It isn't authoritative: saving still validates the value.

**List response:**

```json
{
    "data": [
        {
            "id": "12",
            "version": "3",
            "abilities": { "update": true, "delete": false },
            "title": "…"
        }
    ],
    "meta": { "page": 1, "perPage": 20, "total": 134, "lastPage": 7 }
}
```

**Cursor pagination.** A list with `"pagination": "cursor"` in its definition (`list`) pages with opaque cursors, for lists too large or too live to count: thousands of jobs a day, newest first. Its pages have no number and no total:

```jsonc
// GET /resources/jobs?perPage=50&cursor=eyJpZCI6NDJ9
{
    "data": [/* Item */],
    "meta": { "perPage": 50, "nextCursor": "eyJpZCI6Nzh9", "previousCursor": null, "total": null },
}
```

- `nextCursor` is `null` on the last page. `previousCursor` is `null` when the previous page is the first, which has no cursor; a backend can leave it out, and clients then go back through the cursors they followed. `total` is optional.
- A cursor belongs to its query: changing the sort, filters, search or page size starts over from the first page, without a cursor. A cursor the backend can't read is a `422` problem, with `errors.cursor`.
- Clients show the previous and next pages, and don't offer to select every matching item, since they can't count them.

**Items:**

- Every item has `id`, `version` and `abilities`. `abilities` includes the ids of the actions allowed on that item (`"publish": true`). `view`, `update`, `duplicate` and `delete` show the built-in item actions ([decisions/0040](decisions/0040-row-links-and-open-mode.md)): without them, the client shows none.
- **Item types.** An item of a resource with `types` has `type`, the id of its type ([0077](decisions/0077-resource-types.md)). A create sends it: no type, or one the resource doesn't have, is a `422` with `errors.type`, and a type with `abilities.create: false` is a `403`. Updates ignore it. The fields of the item's type are validated, saved and serialized with those of the resource.
- **Abilities are enforced.** A resource without `viewAny` answers `403` on its list, one without `create` on creates, and an item without `view`, `update` or `delete` on those requests. Items leave out the values of fields with `view: false` ([0046](decisions/0046-abilities-in-the-ui.md)).
- **Single items.** Show, create and update return `{ "data": Item }`. They also send `version` as a quoted `ETag` header (`"3"`).
- **Partial updates.** An update only validates and saves the fields it sends: a list that edits a field in place sends that field alone, with `If-Match` ([decisions/0043](decisions/0043-inline-editing.md)). Its "Undo" saves the previous value the same way, with the version the save just got ([0063](decisions/0063-undo-instead-of-a-confirmation.md)): the backend needs nothing else. Whether a field applies (`visibleWhen`), and rules that read other fields, use the item's values for the fields that aren't sent: a field shown when `status` is `published`, sent alone, is saved on a published item.
- **Version conflicts.** An update with a stale `If-Match` returns `412 Precondition Failed`. The current item is in `current`.
- **`version: null`.** The backend has no versions: it sends no `ETag`, and it ignores `If-Match`.

### Actions

**Request.** `POST /resources/{resource}/actions/{action}` sends the selection and the parameter values:

```jsonc
// Selected items
{ "selection": { "ids": ["12", "13"] }, "values": { "notify": true } }

// Every item matching the list query, except some
{ "selection": { "query": { "filter": { "status": "draft" }, "q": "été" }, "except": ["14"] }, "values": {} }

// Resource scope: no selection
{ "values": { "format": "csv" } }
```

- **Query selection.** The backend applies the same scoping, filters and search as the list endpoint.
- **Files.** Parameters that include files (import) use `multipart/form-data`, with `values[...]` keys.
- **Validation.** Invalid values return `422`, with `errors` keyed by paths inside `values`.

**Response.** `200` with an action result:

```json
{
    "message": "12 pages publiées.",
    "summary": { "succeeded": 12, "failed": 1, "skipped": 2 },
    "results": [
        { "id": "14", "status": "failed", "message": "Le titre est obligatoire." },
        { "id": "15", "status": "skipped", "reason": "forbidden" }
    ],
    "refresh": "items",
    "redirect": null,
    "download": {
        "url": "https://…/exports/pages.csv?signature=…",
        "filename": "pages.csv",
        "expiresAt": "2026-10-14T18:00:00Z"
    }
}
```

- **`results`** only lists the items that didn't succeed.
- **`reason`** for skipped items is `forbidden`, `not_found`, `unchanged` or `in_use`. `in_use`: something else uses the item, so the action can't apply to it: a media that a model uses can't be deleted. The client names the item and says to remove it from where it is used first. When it is the only item, the result has no `undo`; when others were deleted, `undo` lists only those. A `DELETE` of an item in use answers a `409` problem.
- **`refresh`:**
    - `none`;
    - `items`: refetch the affected items;
    - `list`: refetch the list and the counts.
- **`redirect`:** a path or a `{ "route": "…", "params": {} }` object.
- **`download`:** a short-lived URL that the UI opens.
- **`undo`** ([0063](decisions/0063-undo-instead-of-a-confirmation.md)): how to undo the run, for an `undoable` action: `{ "action": "restore", "items": ["12", "13"], "params": {} }`. `action` is an action of the same resource, `items` the items the run changed (not those it skipped or failed), at most `UNDO_LIMIT` (100), and `params` the `values` to run it with. The client runs it as any action, when the user presses "Undo" in the toast of the result, for about 10 seconds; the backend checks it with its policies and keeps no state for it. A run on more items, or that changed none, has no `undo`, nor has a queued run.

**Single item.** A `403` or `404` on the only item of an `item` action is returned as an error, not as a skipped result.

**Dry run.** An action with `"dryRun": true` in the definition answers dry runs: the same request with `"dryRun": true` answers what the action would do, without running it. Lists use it before they confirm an action on every item matching a query ("Select all N items"): they only know the abilities of the current page, and say how many items will be skipped (decision 0017).

```jsonc
// Request
{ "selection": { "query": { "filter": { "status": "draft" } } }, "dryRun": true }

// Response: 200
{ "summary": { "succeeded": 28, "failed": 0, "skipped": 12 }, "results": [{ "id": "15", "status": "skipped", "reason": "forbidden" }] }
```

- **No side effects:** nothing changes, nothing is queued, and the answer is never `202`.
- **`summary`** counts the items that would succeed and those that would be skipped. `results` may list the first skipped items.
- **No values:** a dry run comes before the parameters, so the backend doesn't validate `values`.
- **Opt-in:** the UI only sends `dryRun` to actions that declare it, since a backend that ignores the field would run the action. A dry run of an action that doesn't declare `dryRun` answers `400` and runs nothing.

**Long-running actions.** A queued action, or a selection above the backend's synchronous limit, answers `202 Accepted`:

```json
{
    "run": {
        "id": "run_01JA…",
        "action": "export",
        "resource": "pages",
        "status": "queued",
        "progress": 0,
        "total": 2400
    }
}
```

| Endpoint                     | Purpose                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GET /actions/runs/{run}`    | status (`queued`, `running`, `succeeded`, `partial`, `failed`), `progress`, `total`, and the action result once finished |
| `GET /actions/runs`          | the current user's recent runs, for the notification area                                                                |
| `DELETE /actions/runs/{run}` | cancel a run that hasn't finished, when the action allows it                                                             |

### Context header

When the definition has `context`, the client sends the values of its params in a `Panneau-Context` header, on every request, in the format of a query string, in order: `Panneau-Context: client=4&contest=12` ([decisions/0045](decisions/0045-current-context.md)).

- The backend checks each value for the user. A value the user can't use is a `403` problem of type `urn:panneau:problem:context`, with the refused `param`. Names it doesn't know are ignored.
- `GET /definition` is built for the values. Without a value for a required param, the backend may choose one and say it in `value`.
- A `fixed` param keeps the value the backend sets from the request. Another value in the header is the `403` context problem of that param.
- Each resource applies the values in its scope. Without a value for a required param, the resource routes may answer the same `403` problem.
- `GET /context/{name}/options?q=…` gives the first choices of a param without inline `options` that match `q`, for the values of the params before it: `{ "data": [{ "value": "12", "label": "Summer 2026", "description": "Northwind" }] }`.
- Responses vary with the header (`Vary: Panneau-Context`). A backend on another origin allows it in CORS.

### Errors

Errors use [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) `application/problem+json`:

```json
{
    "type": "urn:panneau:problem:validation",
    "title": "The given data was invalid.",
    "status": 422,
    "errors": {
        "title.fr": ["Le titre est obligatoire."],
        "blocks.2.image": ["Le fichier est trop lourd."]
    }
}
```

- **`errors` keys** are dot paths into the submitted value. Localized values use the locale as a segment, and arrays use the index.
- **`type`:**
    - `urn:panneau:problem:validation` for `422`;
    - `urn:panneau:problem:version-conflict` for `412`;
    - `urn:panneau:problem:context` for a `403` on a value of `Panneau-Context`, with its `param`;
    - `about:blank` when the status says it all.

    Clients rely on the status, not on `type`.

- **Status codes:**

    | Status | Meaning                  |
    | ------ | ------------------------ |
    | `401`  | not authenticated        |
    | `403`  | not allowed              |
    | `404`  | not found                |
    | `409`  | conflict (business rule) |
    | `412`  | version conflict         |
    | `422`  | validation               |
    | `429`  | rate limited             |
    | `5xx`  | server error             |

### Uploads

**Direct uploads.** With `"uploads": { "mode": "presigned" }` in the definition, the browser can also send files to S3-compatible storage itself, in parts for large ones, with URLs that the backend signs ([0025](decisions/0025-presigned-uploads.md)). An upload is not a media: values reference it.

```jsonc
// POST /uploads/sign: the request to sign, as Uppy 6's signRequest gives it
{ "method": "POST", "key": "video.mp4" }
// 200: the presigned URL, and for a new file the key and the upload the backend chose
{ "url": "https://bucket.s3…?X-Amz-Signature=…", "key": "uploads/upl_01H…", "upload": "upl_01H…" }

// POST /uploads/{upload}/complete, once the browser completed the upload in storage, with the file's name
{ "name": "video.mp4" }
// 200: the upload
{ "data": { "id": "upl_01H…", "key": "uploads/upl_01H…", "name": "video.mp4", "mime": "video/mp4", "size": 2147483648 } }

// A value that takes a file takes the upload instead: a file field, the file of a media, an import parameter…
{ "values": { "file": { "upload": "upl_01H…" } } }
```

- **Signing:** the first request of a file (`CreateMultipartUpload`, or `PutObject` for a small file) creates the upload and its key. Later requests (`UploadPart`, `ListParts`, `CompleteMultipartUpload`, `AbortMultipartUpload`) are signed only for a key of the same user's open uploads, and get `404` otherwise. `headers` lists the headers a URL was signed with.
- **Completion** checks that the object exists, and gives the upload. Its optional `name` names the file, since the key the backend chose doesn't keep it.
- **Without direct uploads**, requests with files are sent in `multipart/form-data`.
- **`uploads.endpoint`** moves the two routes elsewhere, for a backend whose upload routes are not under its API.

### Media

A media library is a resource of kind `media` ([0026](decisions/0026-media-libraries.md)). A definition can have several, each with its own fields, list, scope and policies: "Images" and "Documents", or one library per product.

```jsonc
{
    "id": "media",
    "kind": "media",
    "label": { "singular": "média", "plural": "médias" },
    "itemTitle": "name",
    "fields": [
        {
            "name": "file",
            "type": "file",
            "accept": ["image/*", "application/pdf"],
            "rules": [{ "rule": "required" }],
        },
        { "name": "name", "type": "text" },
        { "name": "alt", "type": "text", "localized": true },
    ],
    "list": { "filters": [{ "id": "type", "type": "select" }], "search": true },
}
```

- **The `file` field**, of type `file` and not `multiple`, holds the original. Its `accept` and `maxSize` are the library's.
- **Items have a `media`**, which the backend computes from the file. It is the image of the items (their `itemImage`) unless the library names another field: the gallery and the thumbnails of its list, search results and pickers show its `thumbnailUrl`, or its `url` for an image ([0061](decisions/0061-item-images-in-lists.md)). It is read-only: clients never send it. Its `transform` is the media's own transform, from the library's `transform` field: references give it to the fields, which draw a transform for one use over it ([0031](decisions/0031-image-editor-and-image-field.md)).

    ```jsonc
    {
        "id": "med_01H…",
        "name": "Portrait",
        "file": {
            "name": "portrait.heic",
            "url": "https://…",
            "mime": "image/heic",
            "size": 3145728,
        },
        "media": {
            "type": "image", // image, video, audio, document, font, or another type
            "mime": "image/heic",
            "size": 3145728,
            "url": "https://…", // the main file to show or play
            "thumbnailUrl": "https://…",
            "variants": { "large": { "url": "…", "width": 1600, "height": 2000 } },
            "width": 3024,
            "height": 3780,
            "duration": null,
            "status": "ready", // pending or processing until its renditions are made, then ready or failed; ready without it
            "error": null, // with a failed status: { "code": "timeout", "message": "The poster took too long." }
            "transform": { "rotate": 90 }, // the media's own transform, from its transform field
        },
        "version": "3",
        "abilities": { "update": true, "delete": true },
    }
    ```

- **Operations** are those of resources:

    | Operation              | Request                                                                                        |
    | ---------------------- | ---------------------------------------------------------------------------------------------- |
    | List, search, filter   | `GET /resources/{library}?q=&filter[type]=image`                                               |
    | Show, update metadata  | `GET`/`PATCH /resources/{library}/{id}`                                                        |
    | Make a media of a file | `POST /resources/{library}` with `{ "file": { "upload": "upl_…" } }`, or the file in multipart |
    | Replace the file       | `PATCH /resources/{library}/{id}` with a new `file`                                            |
    | Edit an image          | `PATCH` of the library's `transform` field                                                     |
    | Delete, restore        | `DELETE /resources/{library}/{id}`, and the `restore` action                                   |

- **`filter[type]`** (`image`, `video`, `audio`, `document`, `other`) is supported by every library, for pickers.
- **Scope.** A library holds the media of its scope, like any resource: by type, by a column of the project, by tenant. It gives its scope to the media it makes.
- **Ids** are opaque, as for every resource. A backend may give globally unique ids (`med_…`), which content references.

**Transform.** The non-destructive edits of an image, which renderers (`laravel-image`) apply in this order: crop, then rotate, then flip.

```json
{
    "crop": { "x": 120, "y": 0, "width": 1600, "height": 900 },
    "rotate": 90,
    "flipX": true,
    "focalPoint": { "x": 0.42, "y": 0.35 }
}
```

- **`crop`**: whole pixels of the upright original image, after its EXIF orientation, which is what an editor shows. `x` and `y` are from the top left corner.
- **`rotate`**: `0`, `90`, `180` or `270` degrees, clockwise.
- **`flipX`** mirrors left to right, **`flipY`** top to bottom.
- **`focalPoint`**: from `0` to `1`, relative to the upright original, not to the crop, so changing the crop doesn't move it. Renderers map it into the transformed image and clamp it to the crop.
- **`base`**: what a transform for one use starts from ([0031](decisions/0031-image-editor-and-image-field.md)).
    - Without it, the transform starts from the original file, as above.
    - With `"media"`, it applies over the media's own transform: its crop and focal point are relative to the media's version instead of the original.
    - **`baseTransform`** is then the media's own transform it was made on. When the media's transform is no longer the same, clients ask to check the crop, and renderers clamp it to the image.

    ```json
    {
        "base": "media",
        "baseTransform": { "rotate": 90 },
        "crop": { "x": 0, "y": 900, "width": 3024, "height": 1701 }
    }
    ```

- **Other keys** can be added by editor tools. Renderers ignore the keys they don't know.
- The shape is shared by Panneau, `laravel-mediatheque` 2 (the media's `transform` field) and `laravel-image` 2 (folkloreinc/laravel-image#88).

### Auth

These endpoints only exist with `auth.mode = "panneau"`:

| Endpoint                                                                                               | Purpose                                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `GET /auth/session`                                                                                    | current user and abilities, or `401`                                            |
| `POST /auth/login`, `POST /auth/logout`                                                                | login (password or token) and logout                                            |
| `GET /auth/providers/{provider}/redirect`                                                              | OAuth start; the callback is handled by the backend                             |
| `POST /auth/password/forgot`, `POST /auth/password/reset`                                              | password reset                                                                  |
| `POST /auth/email/verification`, `POST /auth/email/verify`                                             | email verification: send a link, verify its token                               |
| `POST /auth/two-factor/challenge`                                                                      | second factor at login                                                          |
| `POST /auth/password/confirm`                                                                          | confirms the password, for operations that need it                              |
| `POST /auth/passkeys/options`, `POST /auth/passkeys/login`                                             | WebAuthn login                                                                  |
| `GET`/`PATCH /account`, `PUT /account/password`                                                        | the account: name and email, password                                           |
| `GET`/`POST`/`DELETE /account/two-factor`, `…/confirm`, `…/recovery-codes`                             | two-factor authentication: status, setup, confirmation, new recovery codes, off |
| `GET`/`POST /account/passkeys`, `POST /account/passkeys/options`, `DELETE /account/passkeys/{passkey}` | the passkeys of the account                                                     |

With `auth.mode = "external"`, the frontend only calls `GET /auth/session` and sends unauthenticated users to `auth.loginUrl`.

### Search, dashboard, preview

| Endpoint                                                                    | Purpose                                                                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `GET /search?q=&limit=&resources=`                                          | results grouped by resource: `{ "data": [ { "resource": "pages", "items": [...], "total": 34 } ] }` |
| `GET /embeds?url=`                                                          | what a URL embeds, for `embed` fields: `{ "data": EmbedValue }`, or a `422` when it can't embed it  |
| `GET /dashboard/widgets/{widget}?page=`                                     | the data of a widget of a [dashboard](#dashboard) page of the user, `home` without `page`           |
| `GET /dashboard/widgets/{widget}?resource=`                                 | the data of a widget of the [summary](#summary) of a resource, with the list's `filter[…]` and `q`  |
| `GET /dashboard/widgets/{widget}?period[option]=&period[from]=&period[to]=` | with `page` or `resource`: the [period](#period) of its overview                                    |
| `GET /locale/{locale}?next=`                                                | optional: switches the interface to a locale of `interfaceLocales`, then redirects to `next`        |
| `POST /resources/{resource}/{id}/preview`                                   | sends the unsaved values; returns `{ "url": "…", "expiresAt": "…" }` for iframe previews            |

Global search ([decisions/0029](decisions/0029-go-to-palette.md)):

- **Searchable resources.** A resource is searched when its `features.search` is `true`, or, without it, when its list has a search (`list.search`), and the user can list it. With `"search": { "enabled": false }` in the definition, clients don't call `GET /search`.
- **Parameters:**
    - `q`: the search, trimmed, from 2 to 255 characters. The backend searches it the way the list of each resource reads `q`, within the same scope.
    - `limit`: items per resource, an integer from 1 to 20. Defaults to 5.
    - `resources`: comma-separated ids of searchable resources, to search only those (`resources=pages`). Defaults to every searchable resource.
- **Results.** The resources with results, in the order of the definition, at most `limit` items each and 20 in all. Items are serialized as in lists. `total`, when the backend counts it, is how many items of the resource match: the list of the resource, with `q`, shows them all. An item's title is its resource's `itemTitle`; `itemSubtitle` and `itemImage` name the fields shown under it and next to it, in search results, cards and pickers; a media library's image is the `media` of its items.
- **Errors:**
    - an invalid parameter is a `422` problem, with `errors` keyed by parameter (`q`, `limit`, `resources`): a search shorter than 2 characters, a limit out of bounds, or a resource that isn't searchable;
    - a backend can limit how often a user searches: `429`, with `Retry-After` in seconds. Clients wait for the next search, and say so.
- **Reference.** `readSearchQuery()` of `@panneau/protocol/runtime` reads and validates these parameters; `toSearchQueryParams()` writes them.

## Conformance

`@panneau/protocol` ships:

- **schemas and TypeScript types**. `Definition` is a definition after parsing, with defaults applied; `DefinitionInput` is a definition as a backend writes it.
- **validation helpers**:
    - `validateDefinition()` checks the schema, then the references between parts;
    - `lintDefinition()` checks those references alone: layout nodes and columns that name a field, relations that name a resource, unique names, the aggregates of lists, and the widgets of the dashboards and the summaries on a resource;
    - `validateBootConfig()` checks a [boot config](#boot-config).
- **the portable rules**: `checkValues()` is the reference implementation.
- **range filters**: `matchesFilterRange()` is the reference of how a backend reads the bounds of a range.
- **a light entry point for browsers** (`@panneau/protocol/runtime`): the constants and the helpers above that don't need the schemas (`checkValues()`, `evaluateCondition()`, `lintDefinition()`, the list query helpers, `isProblem()`), without loading zod. UI packages import them from there, and only types from the main entry point.
- **generated files**: `@panneau/protocol/definition.schema.json` and `@panneau/protocol/boot.schema.json` (JSON Schema 2020-12), and `@panneau/protocol/openapi.json` (OpenAPI 3.1).
- **a mock backend** (`@panneau/protocol/mock`): an in-memory implementation of the resource routes, and of the widgets of the dashboard with the data of its `widgets` option.
- **a conformance kit** (`@panneau/protocol/conformance`): `runConformance()` calls a live backend and checks its responses against the schemas. For a list paged with cursors, it also follows `nextCursor`, and checks that an invalid cursor is a `422`. With `writes`, it also checks that rules limited to `create` don't apply to updates: an update with those fields set to `null` succeeds. It also checks that an update of a single field, with `If-Match`, changes that field alone, and that an update ignores the values of fields with `notInForm` ([0071](decisions/0071-fields-out-of-forms.md)). It also checks that the built-in `delete` answers a dry run without being declared and, with `writes`, that an item that allows `duplicate` is copied under a new id, with its `ETag`. It also checks that the API agrees with the abilities it announces ([0046](decisions/0046-abilities-in-the-ui.md)): resources without `viewAny` answer `403` on their list, items leave out the values of fields with `view: false`, and a dry run of `delete` skips an item without `delete`; with `writes`, an empty create of a resource without `create`, and an empty update of an item without `update`, answer `403`. It also checks that the backend reads the bounds of the resource's first `date-range` filter, if it has one, and that `GET /search` finds an item by a word of its title, reads `limit` and `resources`, and refuses invalid parameters with a `422`. With a `dashboard`, it checks that each widget with data of its own answers in the shape of its type (or a `403`), that the lists and the aggregates of the widgets on a resource answer their query, with a total for a `stat`, that each aggregate a combined widget reads answers in its shape, and that a widget that isn't in the dashboard is a `404`. It checks the widgets of each dashboard page and of the summary of each resource the same way (`?page=`, `?resource=`), and that a widget with both is a `422`. For each overview with a period, it checks that the widgets with data of their own that follow it answer with the parameters of its default period, and that a wrong period is a `422`. For each resource with aggregates, it checks that `GET /resources/{resource}/aggregate` counts the items of the list, answers each declared sum, group and period in the shape of a widget, with a point per period and the range of the `date-range` filter on the date, and refuses what isn't declared with a `422`; a resource without aggregates is a `404`. With a `context` in the definition, it checks the choices of each param, a definition built for a value of the first param, and a value that doesn't exist refused with a `403` context problem. `context` sends values with every request, for a backend whose resources need one.

```ts
import { formatReport, runConformance } from '@panneau/protocol/conformance';

const report = await runConformance({
    baseUrl: 'http://localhost:8000/panneau/api',
    init: { headers: { Authorization: `Bearer ${token}` } },
    resource: 'pages',
    // Optional: also checks create, update (with If-Match), conflicts and delete.
    writes: { create: { title: { fr: 'Test' } }, update: { title: { fr: 'Test 2' } } },
});
console.log(formatReport(report));
```

`laravel-panneau` validates its responses against `openapi.json`, and the page of the app against `boot.schema.json`, in its feature tests.
