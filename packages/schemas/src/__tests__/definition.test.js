import validator from '../validator';

test('definition.json data validate schema', () => {
    const data = require('./data/definition.json');
    const schema = require('../schemas/definition.json');
    const result = validator.validate(data, schema);
    if (!result.valid) {
        console.log(result);
    }
    expect(result.valid).toBe(true);
});
