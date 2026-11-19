import { loadPanneauMessages } from '@panneau/intl';

import { BooleanFieldEntry } from '../boolean/BooleanField';
import { DateFieldEntry } from '../date/DateField';
import { DateTimeFieldEntry } from '../datetime/DateTimeField';
import { EmailFieldEntry } from '../email/EmailField';
import { GroupFieldEntry } from '../group/GroupField';
import { NumberFieldEntry } from '../number/NumberField';
import { RangeFieldEntry } from '../range/RangeField';
import { RelationFieldEntry } from '../relation/RelationField';
import { RepeaterFieldEntry } from '../repeater/RepeaterField';
import { SelectFieldEntry } from '../select/SelectField';
import { SlugFieldEntry } from '../slug/SlugField';
import { TagsFieldEntry } from '../tags/TagsField';
import { TextFieldEntry } from '../text/TextField';
import { TextAreaFieldEntry } from '../textarea/TextAreaField';
import { TimeFieldEntry } from '../time/TimeField';
import { UrlFieldEntry } from '../url/UrlField';
import { lazyFieldEntry } from './lazy';
import type { FieldEntry } from './types';

/**
 * The entries of the built-in field types. Those with heavy code (a phone number's metadata, a
 * map, the countries…) load it on first use, with the skeleton of the field until then (#346).
 * `richtext` and `media` come with their plugins (`@panneau/editor` and `@panneau/media`): without
 * them, `DefinitionField` renders a placeholder. `file` uploads through the upload source of the
 * fields context, or gives the files themselves. `embed`, `location` and `address` use its embed
 * source and its maps; `location` loads Leaflet when shown. `link` searches its pages with the
 * relation source, and picks its files with the `media` entry.
 */
export const builtInFields: Readonly<Record<string, FieldEntry>> = {
    text: TextFieldEntry,
    textarea: TextAreaFieldEntry,
    number: NumberFieldEntry,
    boolean: BooleanFieldEntry,
    date: DateFieldEntry,
    datetime: DateTimeFieldEntry,
    time: TimeFieldEntry,
    select: SelectFieldEntry,
    email: EmailFieldEntry,
    url: UrlFieldEntry,
    color: lazyFieldEntry(async () => (await import('../color/ColorField')).ColorFieldEntry),
    // In the bundle: a slug follows its source from when it shows, and the source is often typed
    // first
    slug: SlugFieldEntry,
    file: lazyFieldEntry(async () => (await import('../file/FileField')).FileFieldEntry),
    relation: RelationFieldEntry,
    group: GroupFieldEntry,
    repeater: RepeaterFieldEntry,
    tel: lazyFieldEntry(async () => (await import('../tel/TelField')).TelFieldEntry),
    range: RangeFieldEntry,
    duration: lazyFieldEntry(
        async () => (await import('../duration/DurationField')).DurationFieldEntry,
    ),
    json: lazyFieldEntry(async () => (await import('../json/JsonField')).JsonFieldEntry),
    tags: TagsFieldEntry,
    embed: lazyFieldEntry(async () => (await import('../embed/EmbedField')).EmbedFieldEntry),
    location: lazyFieldEntry(
        async () => (await import('../location/LocationField')).LocationFieldEntry,
    ),
    country: lazyFieldEntry(
        async () => (await import('../country/CountryField')).CountryFieldEntry,
    ),
    region: lazyFieldEntry(async () => (await import('../region/RegionField')).RegionFieldEntry),
    address: lazyFieldEntry(
        async () => (await import('../address/AddressField')).AddressFieldEntry,
    ),
    link: lazyFieldEntry(async () => (await import('../link/LinkField')).LinkFieldEntry),
    daterange: lazyFieldEntry(
        async () => (await import('../daterange/DateRangeField')).DateRangeFieldEntry,
    ),
    money: lazyFieldEntry(async () => (await import('../money/MoneyField')).MoneyFieldEntry),
};

/**
 * The built-in fields as a `@panneau/core` plugin: their entries, and the French messages of
 * every Panneau package (`@panneau/ui`, `@panneau/fields`, `@panneau/forms`…, from
 * `@panneau/intl`), loaded on first use. Pass it before the plugins that override a type.
 * `@panneau/fields` doesn't depend on `@panneau/core`: the plugin is typed as `definePlugin()`
 * would type it.
 */
export const fieldsPlugin: {
    id: string;
    fields: Readonly<Record<string, FieldEntry>>;
    locales: Readonly<Record<string, () => Promise<Record<string, string>>>>;
} = {
    id: 'panneau.fields',
    fields: builtInFields,
    locales: { fr: () => loadPanneauMessages('fr') },
};
