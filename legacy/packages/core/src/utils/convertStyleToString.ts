import isNumber from 'lodash-es/isNumber';

// Convert a camelCase style property (ex: backgroundColor) to its CSS kebab-case
// name (ex: background-color). Custom properties (--foo) are kept as is.
function toCssProperty(key: string): string {
    if (key.startsWith('--')) {
        return key;
    }
    const property = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    return property.startsWith('ms-') ? `-${property}` : property;
}

function convertStyleToString(style: Record<string, unknown> | null): string {
    return style !== null
        ? Object.keys(style)
              .map(
                  (key) =>
                      `${toCssProperty(key)}:${isNumber(style[key]) ? `${style[key]}px` : style[key]};`,
              )
              .join('\n')
        : '';
}

export default convertStyleToString;
