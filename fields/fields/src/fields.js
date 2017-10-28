import Text, { TextLocale } from '@react-panneau/field-text';
import Code from '@react-panneau/field-code';
import Select from '@react-panneau/field-select';
import Color from '@react-panneau/field-color';
import Date from '@react-panneau/field-date';
import Slider from '@react-panneau/field-slider';
import Toggle from '@react-panneau/field-toggle';

import FieldsCollection from './lib/FieldsCollection';

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
