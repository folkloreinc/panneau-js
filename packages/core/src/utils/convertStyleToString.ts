import isNumber from 'lodash-es/isNumber';
import { snakeCase } from 'snake-case';

function convertStyleToString(style: Record<string, unknown> | null): string {
    return style !== null
        ? Object.keys(style)
              .map(
                  (key) =>
                      `${snakeCase(key)}:${isNumber(style[key]) ? `${style[key]}px` : style[key]};`,
              )
              .join('\n')
        : '';
}

export default convertStyleToString;
