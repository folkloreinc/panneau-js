import { Validator } from 'jsonschema';
import * as schemas from './schemas/index';

const validator = new Validator();

Object.keys(schemas).forEach((name) => {
    validator.addSchema(schemas[name], `${name}.json`);
    validator.addSchema(schemas[name], `http://panneau.dev/schemas/${name}.json`);
});

export default validator;
