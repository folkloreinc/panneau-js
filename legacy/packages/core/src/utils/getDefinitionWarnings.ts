import isObject from 'lodash-es/isObject';

import type { PanneauDefinition } from '../types';

/**
 * Returns a message for each key of the definition that is not supported anymore,
 * with the key to use instead. Without it, these keys would be silently ignored.
 */
function getDefinitionWarnings(definition: PanneauDefinition | null): string[] {
    if (!isObject(definition)) {
        return [];
    }
    const { components = null, intl = null, theme = null, resources = [] } = definition;
    const { values = null } = intl || {};

    return [
        ...(components !== null
            ? [
                  '`components` is not supported: give the custom components to the `components` prop of the container.',
              ]
            : []),
        ...(values !== null
            ? [
                  '`intl.values` is not supported: set the values of each resource in `resources[].intl.values`.',
              ]
            : []),
        ...Object.keys(theme || {})
            .filter((key) => key !== 'colorScheme')
            .map((key) => `\`theme.${key}\` is not supported: only \`theme.colorScheme\` is.`),
        ...(resources || []).reduce<string[]>((warnings, resource) => {
            const {
                id,
                components: resourceComponents = null,
                columns = null,
            } = resource as typeof resource & { components?: unknown; columns?: unknown };
            return [
                ...warnings,
                ...(resourceComponents !== null
                    ? [
                          `\`resources[${id}].components\` is not supported: use \`index.component\`, \`forms.default.component\` and \`pages\`.`,
                      ]
                    : []),
                ...(columns !== null
                    ? [`\`resources[${id}].columns\` is not supported: use \`index.columns\`.`]
                    : []),
            ];
        }, []),
    ];
}

export default getDefinitionWarnings;
