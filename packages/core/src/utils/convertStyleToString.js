import isNumber from 'lodash/isNumber';
import { snakeCase } from 'snake-case';

const convertStyleToString = (style) =>
    style !== null
        ? Object.keys(style)
              .map(
                  (key) =>
                      `${snakeCase(key)}:${isNumber(style[key]) ? `${style[key]}px` : style[key]};`,
              )
              .join('\n')
        : '';

export default convertStyleToString;
