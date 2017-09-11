import FieldsCollection from '../lib/FieldsCollection';

import Select from './SelectField';
import Text from './TextField';
import Color from './ColorField';
import Code from './CodeField';
import Slider from './SliderField';

const fields = {
    Select,
    Text,
    Color,
    Code,
    Slider,
};

const fieldsCollection = new FieldsCollection(fields);

export default fieldsCollection;
