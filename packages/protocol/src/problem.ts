import type { Problem } from './schemas/api';
import { isRecord } from './values';

const isOptional = (value: unknown, check: (value: unknown) => boolean) =>
    value === undefined || check(value);
const isString = (value: unknown) => typeof value === 'string';

/**
 * Whether a value is a problem details object (an API error). It checks the same shape as the
 * `Problem` schema, without zod, so that UI packages can detect errors without loading the schemas.
 */
export function isProblem(value: unknown): value is Problem {
    if (!isRecord(value)) {
        return false;
    }
    const { type, title, status, detail, instance, errors, current } = value;
    return (
        isString(type) &&
        isString(title) &&
        Number.isInteger(status) &&
        (status as number) >= 400 &&
        (status as number) <= 599 &&
        isOptional(detail, isString) &&
        isOptional(instance, isString) &&
        isOptional(
            errors,
            (messages) =>
                isRecord(messages) &&
                Object.values(messages).every(
                    (list) => Array.isArray(list) && list.every(isString),
                ),
        ) &&
        isOptional(current, isItem)
    );
}

function isItem(value: unknown): boolean {
    if (!isRecord(value)) {
        return false;
    }
    const { id, version, abilities } = value;
    return (
        isString(id) &&
        id !== '' &&
        (version === null || isString(version)) &&
        isRecord(abilities) &&
        Object.values(abilities).every((ability) => typeof ability === 'boolean')
    );
}
