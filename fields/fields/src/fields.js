import Text from '@react-panneau/field-text';
import Code from '@react-panneau/field-code';
import Select from '@react-panneau/field-select';

import FieldsCollection from './lib/FieldsCollection';

const fieldsCollection = new FieldsCollection({
    Text,
    Code,
    Select,
});

export default fieldsCollection;
