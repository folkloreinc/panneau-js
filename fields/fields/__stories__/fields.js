import Text from '../../text/src/index';
import Code from '../../code/src/index';
import Select from '../../select/src/index';

import FieldsCollection from '../src/lib/FieldsCollection';

const fieldsCollection = new FieldsCollection({
    Text,
    Code,
    Select,
});

export default fieldsCollection;
