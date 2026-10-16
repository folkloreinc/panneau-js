---
'@panneau/protocol': minor
---

Add the boot config, which a server writes in the page of the app (`<script type="application/json" id="panneau-boot">`): the `BootConfig` schema and type (`protocol`, `apiBaseUrl`, `basePath`, `locale`, an optional inlined `definition` and `loginUrl`), `validateBootConfig()`, `BOOT_CONFIG_ELEMENT_ID`, `createBootConfigJsonSchema()` and the generated `@panneau/protocol/boot.schema.json`.
