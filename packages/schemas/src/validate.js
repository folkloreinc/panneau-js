import validator from './validator';
import schema from './schemas/definition';

const validate = data => validator.validate(data, schema);

export default validate;
