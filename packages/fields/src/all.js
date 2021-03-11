import { FieldsManager } from '@panneau/core';

// Import fields

const fields = {};

const allFields = Object.keys(fields).map((name) => fields[name]);

const manager = new FieldsManager(allFields);

export default manager;
