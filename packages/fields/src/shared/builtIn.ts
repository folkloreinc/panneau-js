import { fr } from '@panneau/intl';

import { BooleanFieldEntry } from '../boolean/BooleanField';
import { ColorFieldEntry } from '../color/ColorField';
import { DateFieldEntry } from '../date/DateField';
import { DateTimeFieldEntry } from '../datetime/DateTimeField';
import { EmailFieldEntry } from '../email/EmailField';
import { FileFieldEntry } from '../file/FileField';
import { GroupFieldEntry } from '../group/GroupField';
import { NumberFieldEntry } from '../number/NumberField';
import { RelationFieldEntry } from '../relation/RelationField';
import { RepeaterFieldEntry } from '../repeater/RepeaterField';
import { SelectFieldEntry } from '../select/SelectField';
import { SlugFieldEntry } from '../slug/SlugField';
import { TextFieldEntry } from '../text/TextField';
import { TextAreaFieldEntry } from '../textarea/TextAreaField';
import { TimeFieldEntry } from '../time/TimeField';
import { UrlFieldEntry } from '../url/UrlField';
import type { FieldEntry } from './types';

/**
 * The entries of the built-in field types. `richtext` and `media` come with their plugins
 * (`@panneau/editor` and `@panneau/media`): without them, `DefinitionField` renders a placeholder.
 * `file` uploads through the upload source of the fields context, or gives the files themselves.
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
    color: ColorFieldEntry,
    slug: SlugFieldEntry,
    file: FileFieldEntry,
    relation: RelationFieldEntry,
    group: GroupFieldEntry,
    repeater: RepeaterFieldEntry,
};

/**
 * The built-in fields as a `@panneau/core` plugin: their entries, and the French messages of
 * every Panneau package (`@panneau/ui`, `@panneau/fields`, `@panneau/forms`…, from
 * `@panneau/intl`). Pass it before the plugins that override a type.
 */
export const fieldsPlugin: {
    id: string;
    fields: Readonly<Record<string, FieldEntry>>;
    locales: Readonly<Record<string, Record<string, string>>>;
} = {
    id: 'panneau-fields',
    fields: builtInFields,
    locales: { fr },
};
