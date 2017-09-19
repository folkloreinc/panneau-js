import FieldsCollection from '../lib/FieldsCollection';

import Select from './SelectField';
import Text from './TextField';
import Color from './ColorField';
import Code from './CodeField';
import Slider from './SliderField';
import Date from './DateField';
import Toggle from './ToggleField';
import Locale from './LocaleField';

const fields = {
    Select,
    Text,
    Color,
    Code,
    Slider,
    Date,
    Toggle,
    Locale,
};

const fieldsCollection = new FieldsCollection(fields);

export default fieldsCollection;
