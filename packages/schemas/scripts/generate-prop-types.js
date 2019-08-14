/* eslint-disable no-use-before-define */
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const prettier = require('prettier');
const uniq = require('lodash/uniq');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');
const get = require('lodash/get');
const colors = require('colors');

const prettierConfig = require('../../../.prettierrc.json');

const srcDir = path.join(__dirname, '../src');
const destDir = path.join(__dirname, '../src/prop-types');
const files = glob.sync(path.join(srcDir, 'schemas/*.json'));
const schemas = files.reduce(
    (map, file) => ({
        ...map,
        [path.basename(file, '.json')]: require(file),
    }),
    {},
);

const getPropertyWithAllOf = property => {
    const { allOf = null } = property;
    if (allOf === null) {
        return property;
    }
    return allOf.reduce(
        (
            { properties = null, ...newProperty },
            {
                then: { properties: thenProperties = null, ...then } = {},
                properties: allOfProperties = null,
                ...allOfProperty
            },
        ) => {
            return {
                ...newProperty,
                ...(properties !== null || allOfProperties !== null || thenProperties !== null
                    ? {
                          properties: {
                              ...properties,
                              ...thenProperties,
                              ...allOfProperties,
                          },
                      }
                    : null),
                ...then,
                ...allOfProperty,
            };
        },
        property,
    );
};

const getPropTypeFromProperties = (property, schema) => {
    const { required = false, properties = {}, additionalProperties = true } = getPropertyWithAllOf(
        property,
    );
    const requiredSuffix = required === true ? '.isRequired' : '';
    const shape = Object.keys(properties).map(propertyName => {
        return `${propertyName}: ${getPropTypeFromProperty(
            {
                required: isArray(required) && required.indexOf(propertyName) !== -1,
                ...properties[propertyName],
            },
            schema,
        )}`;
    });
    return !additionalProperties
        ? `PropTypes.exact({${shape.join(',')}})${requiredSuffix}`
        : `PropTypes.shape({${shape.join(',')}})${requiredSuffix}`;
};

const getPropTypeFromPropertyType = (type, property, schema) => {
    const { additionalProperties = null, items = {}, required = false } = property;
    const requiredSuffix = required === true ? '.isRequired' : '';
    switch (type) {
        case 'object':
            if (isObject(additionalProperties)) {
                return `PropTypes.objectOf(${getPropTypeFromProperty(
                    additionalProperties,
                    schema,
                )})${requiredSuffix}`;
            }
            return getPropTypeFromProperties(property, schema);
        case 'array':
            return `PropTypes.arrayOf(${getPropTypeFromProperty(
                getPropertyWithAllOf(items),
                schema,
            )})${requiredSuffix}`;
        case 'boolean':
            return `PropTypes.bool${requiredSuffix}`;
        case 'integer':
        case 'number':
            return `PropTypes.number${requiredSuffix}`;
        case 'string':
            return `PropTypes.string${requiredSuffix}`;
        default:
            return `PropTypes.any${requiredSuffix}`;
    }
};

const getPropTypeFromProperty = (property, schema) => {
    const { $id } = schema;
    const { type = null, $ref = null } = property;
    if ($ref !== null) {
        let refMatches = $ref.match(/^#\/(.*)$/);
        if (refMatches !== null) {
            return getPropTypeFromProperty(
                getPropertyWithAllOf(get(schema, refMatches[1].replace(/\//, '.'))),
                schema,
            );
        }
        refMatches = $ref.match(/(.*?\/)?([^/]+)\.json$/);
        const idMatches = $id.match(/(.*?\/)?([^/]+)\.json$/);
        if (refMatches[2] === idMatches[2]) {
            return 'PropTypes.object';
        }
        return refMatches[2];
    }
    if (isArray(type)) {
        return `PropTypes.oneOfType([${type
            .map(subType => getPropTypeFromPropertyType(subType, property, schema))
            .join(',')}])`;
    }
    return getPropTypeFromPropertyType(type, property, schema);
};

const getPropTypeFromSchema = schema => {
    return getPropTypeFromProperties(schema, schema);
};

const getImportsFromSchema = schema => {
    const { $id, properties = {} } = getPropertyWithAllOf(schema);
    const imports = [];
    const schemaName = $id.match(/^(.*?\/)?([^/]+)\.json$/)[2];
    Object.keys(properties).forEach(propertyName => {
        const property = properties[propertyName];
        const { $ref = null, items: { $ref: itemsRef = null } = {} } = property;
        const refs = [$ref, itemsRef].filter(it => it !== null);
        refs.forEach(ref => {
            const matches = ref.match(/(.*?\/)?([^/]+)\.json$/);
            if (matches !== null && matches[2] !== schemaName) {
                imports.push(`import ${matches[2]} from './${matches[2]}';`);
            }
        });
    });
    return uniq(imports).join('\n');
};

const propTypesFiles = Object.keys(schemas).reduce((map, schemaName) => {
    const schema = schemas[schemaName];
    const schemaImports = getImportsFromSchema(schema);
    const output = `
        import PropTypes from 'prop-types';
        ${schemaImports}

        export default ${getPropTypeFromSchema(schema)};
    `;
    const prettyOutput = prettier.format(output, {
        parser: 'babel',
        ...prettierConfig,
    });
    return {
        ...map,
        [schemaName]: prettyOutput,
    };
}, {});

console.log(colors.yellow('Ensure proptypes directory...'));
fsExtra.ensureDirSync(destDir);

console.log(colors.yellow('Writing proptypes files...'));
Object.keys(propTypesFiles).forEach(name => {
    const output = propTypesFiles[name];
    const filePath = path.join(destDir, `${name}.js`);
    fsExtra.ensureFileSync(filePath);
    fs.writeFileSync(filePath, output);
});

console.log(colors.yellow('Writing index file...'));
const indexOutput = `
    ${Object.keys(propTypesFiles)
        .map(name => `import ${name} from './${name}';`)
        .join('\n')}

    export {${Object.keys(propTypesFiles).join(',')}};
`;
const indexPrettyOutput = prettier.format(indexOutput, {
    parser: 'babel',
    ...prettierConfig,
});
const indexPath = path.join(destDir, 'index.js');
fsExtra.ensureFileSync(indexPath);
fs.writeFileSync(indexPath, indexPrettyOutput);

console.log(colors.green('Done.'));
