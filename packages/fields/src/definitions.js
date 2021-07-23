import isArray from 'lodash/isArray';
import { definition as Autocomplete } from '@panneau/field-autocomplete';
import { definition as Checkboxes } from '@panneau/field-checkboxes';
import { definition as Color } from '@panneau/field-color';
import { definition as Date } from '@panneau/field-date';
import { definition as Embed } from '@panneau/field-embed';
import { definition as Fields } from '@panneau/field-fields';
import { definition as Html } from '@panneau/field-html';
import { definition as InputGroup } from '@panneau/field-input-group';
import { definition as Item } from '@panneau/field-item';
import { definition as Items } from '@panneau/field-items';
import { definition as Localized } from '@panneau/field-localized';
import { definition as Number } from '@panneau/field-number';
import { definition as Radios } from '@panneau/field-radios';
import { definition as Select } from '@panneau/field-select';
import { definition as Text } from '@panneau/field-text';
import { definition as Toggle } from '@panneau/field-toggle';
import { definition as Toggles } from '@panneau/field-toggles';
import { definition as Upload } from '@panneau/field-upload';
import { definition as Url } from '@panneau/field-url';


export default [
    Autocomplete,
    Checkboxes,
    Color,
    Date,
    Embed,
    Fields,
    Html,
    InputGroup,
    Item,
    Items,
    Localized,
    Number,
    Radios,
    Select,
    Text,
    Toggle,
    Toggles,
    Upload,
    Url,
].reduce(
    (allFields, definition) => [...allFields, ...(isArray(definition) ? definition : [definition])],
    [],
);
