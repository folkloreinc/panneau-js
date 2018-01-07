import Text, { TextLocale } from '@panneau/field-text';
import Code from '@panneau/field-code';
import Select from '@panneau/field-select';
import Color from '@panneau/field-color';
import Date from '@panneau/field-date';
import Slider from '@panneau/field-slider';
import Toggle from '@panneau/field-toggle';

import FieldsCollection from './FieldsCollection';

const fieldsCollection = new FieldsCollection({
    Text,
    TextLocale,
    Code,
    Select,
    Color,
    Date,
    Slider,
    Toggle,
});

export default fieldsCollection;
