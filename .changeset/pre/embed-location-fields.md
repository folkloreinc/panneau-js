---
'@panneau/protocol': minor
'@panneau/data': minor
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/intl': minor
'@panneau/app': minor
---

Two more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):

- **`embed`:** the URL of a video, a sound or a post. The backend resolves it with the provider's oEmbed (`GET /embeds?url=`), and the field shows its title and thumbnail. Without the endpoint, the value is `{ url }`.
- **`location`:** a point and its address, `{ lat, lng, address }`, placed on a Leaflet map loaded on demand, typed, or found by address through a pluggable geocoding source.

And:

- **`@panneau/protocol`:** `EmbedValue`, `EmbedResponse` and `LocationValue`, `GET /embeds` in the OpenAPI document, the two types in `BUILT_IN_FIELD_TYPES`, and `/embeds` in the mock backend.
- **`@panneau/data`:** `resolveEmbed()`, optional in `DataAdapter`, implemented by the REST adapter.
- **`@panneau/fields`:** `EmbedField` and `LocationField` at `@panneau/fields/embed` and `/location`; `createEmbedSource()`; the `embedSource` and `maps` of `FieldsProvider`; `GeocodingSource` and `createNominatimSource()`.
- **`@panneau/lists`:** `EmbedDisplay` and `LocationDisplay`.
- **`@panneau/app`:** the `maps` option, and the embed source of the adapter.
- **`@panneau/intl`:** the messages of the new fields, in English and French.
