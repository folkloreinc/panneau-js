// Writes the generated JSON Schema and OpenAPI files from the built package.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createDefinitionJsonSchema, createOpenApiDocument } from '../dist/index.js';

const directory = resolve(import.meta.dirname, '../schema');
const write = (name, value) =>
    writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 4)}\n`);

write('definition.schema.json', createDefinitionJsonSchema());
write('openapi.json', createOpenApiDocument());
