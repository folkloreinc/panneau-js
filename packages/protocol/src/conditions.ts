import type { Condition } from './schemas/common';
import { getValue, isEqual, isFilled } from './values';

/**
 * Evaluates a `visibleWhen` condition against form values. An empty condition is true. Paths are
 * relative to `values`.
 */
export function evaluateCondition(condition: Condition, values: unknown): boolean {
    if (
        condition.all !== undefined &&
        !condition.all.every((child) => evaluateCondition(child, values))
    ) {
        return false;
    }
    if (
        condition.any !== undefined &&
        !condition.any.some((child) => evaluateCondition(child, values))
    ) {
        return false;
    }
    if (condition.field === undefined) {
        return true;
    }
    const value = getValue(values, condition.field);
    if ('equals' in condition && !isEqual(value, condition.equals)) {
        return false;
    }
    if (
        condition.in !== undefined &&
        !condition.in.some((candidate) => isEqual(value, candidate))
    ) {
        return false;
    }
    if (
        condition.notIn !== undefined &&
        condition.notIn.some((candidate) => isEqual(value, candidate))
    ) {
        return false;
    }
    if (condition.filled !== undefined && isFilled(value) !== condition.filled) {
        return false;
    }
    return true;
}
