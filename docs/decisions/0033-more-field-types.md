# 0033: More field types: tel, range, duration, json, tags, embed and location

- Status: accepted
- Date: 2026-10-23
- Issue: [#111](https://github.com/folkloreinc/panneau-js/issues/111)

## Context

Panneau 5 has the field types of the definitions of Folklore sites, but not some that content often needs: a phone number, a value on a slider, a duration, structured data, tags, an embedded video and a place. Projects either fall back on `text` or write their own field.

`richtext` has its own item in the roadmap. Choices shown as radios or checkboxes already exist: `select` with `widget: "radios"` or `"checkboxes"`.

## Decision

Seven built-in types. Each one has a value in the protocol, the portable rules that apply to it, a field, a display in lists, and the same value in every backend.

### Without a service

- **`tel`:** a phone number, a string as typed. The input asks for a phone keyboard. `pattern` constrains it when a project needs a format. Lists link it with `tel:`.
- **`range`:** a number on a slider.
    - `min` and `max` rules set its ends, 0 and 100 by default.
    - Settings: `step` (1 by default), `decimals` and `suffix`, as for `number`.
    - The value is `null` until the slider is moved, then a number.
- **`duration`:** a whole number of seconds, typed in hours, minutes and seconds.
    - `settings.precision` is `seconds` (the default) or `minutes`, which hides the seconds.
    - `min` and `max` are in seconds. Lists show it with its units, `1 h 5 min 30 s`.
- **`json`:** an object or an array, edited as JSON text.
    - While the text doesn't parse, the value is the text itself. A string is never a valid value, so the portable rules refuse it (`json`), and the form can't be submitted with text that doesn't parse. Backends refuse anything but an object, an array or `null`.
    - Lists show it on one line, shortened.
- **`tags`:** a list of strings.
    - `options` suggest values as the user types.
    - `settings.allowCustom` (`true` by default) allows words outside the options. With `false`, only options are allowed, and `in` applies to each tag.
    - `min` and `max` count the tags. Tags are trimmed, and a tag already in the list isn't added again.
    - Lists show them as badges.

### With a service

- **`embed`:** a URL of a video, a sound or a post.
    - The value is `{ "url", "type", "title", "provider", "thumbnailUrl", "html", "width", "height" }`, where everything but `url` comes from the provider's oEmbed.
    - The backend resolves it: `GET /embeds?url=` answers that value, or a `422` when it can't embed the URL. A client never calls a provider itself.
    - The field shows the title and the thumbnail. Without the endpoint, the value is `{ "url" }`.
- **`location`:** a point and its address, `{ "lat", "lng", "address" }`.
    - The field places the point on a map, Leaflet with raster tiles: OpenStreetMap by default, or the `tiles` of the field's settings or of the app. Leaflet loads only when a location field is shown.
    - The latitude and the longitude can also be typed.
    - The address search is pluggable, like the sources of relations and uploads: a `GeocodingSource` of `FieldsProvider` turns an address into points. Without one, the field has no address search. `createNominatimSource()` is a ready-made source for small volumes.
    - Lists show the address, or the coordinates.

## Consequences

- `@panneau/ui` gets a `Slider` and a `TagsInput`.
- `@panneau/fields` depends on Leaflet, loaded on demand.
- The portable rules check the type of `json` values: the first rule that reads a field's type.
- The protocol has one more endpoint, `GET /embeds`, and the mock backend answers it.
- `laravel-panneau` gets the seven types, their rules and the endpoint of embeds.
