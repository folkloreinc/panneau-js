import type { Field, RuleFailure } from '@panneau/protocol';
import { usePanneauIntl } from '@panneau/ui';

import { messages } from './messages';
import { getPathSteps } from './paths';

const COUNTED = new Set(['repeater', 'relation', 'media', 'select']);

/**
 * Translates the failures of the portable rules with react-intl, for `formatError`. `min` and
 * `max` say "characters" for texts and "items" for lists, from the field at the path, and `crop`
 * names its ratios. A rule's own `message` wins.
 */
export function useFormatRuleFailure(
    fields: readonly Field[],
): (failure: RuleFailure, path: string) => string {
    const intl = usePanneauIntl();
    return (failure, path) => {
        if (failure.message !== undefined) {
            return failure.message;
        }
        const step = getPathSteps(fields, path).at(-1);
        const field = step?.field;
        const value = typeof failure.value === 'number' ? failure.value : 0;
        if (failure.rule === 'min' || failure.rule === 'max') {
            const list =
                field !== undefined &&
                step?.index === undefined &&
                COUNTED.has(field.type) &&
                (field.type === 'repeater' || field.multiple === true);
            const numeric = field?.type === 'number';
            const key = list
                ? failure.rule === 'min'
                    ? 'minItems'
                    : 'maxItems'
                : numeric
                  ? failure.rule
                  : failure.rule === 'min'
                    ? 'minLength'
                    : 'maxLength';
            return intl.formatMessage(messages.rule[key], { value });
        }
        if (failure.rule === 'crop') {
            const given =
                typeof failure.value === 'object' && failure.value !== null
                    ? (failure.value as { ratios?: unknown }).ratios
                    : undefined;
            const ratios = Array.isArray(given)
                ? given.filter((ratio): ratio is string => typeof ratio === 'string')
                : [];
            return ratios.length > 0
                ? intl.formatMessage(messages.rule.cropRatios, {
                      ratios: intl.formatList(ratios, { type: 'disjunction' }),
                  })
                : intl.formatMessage(messages.rule.crop);
        }
        const rule = failure.rule as keyof typeof messages.rule;
        if (rule in messages.rule && rule !== 'min' && rule !== 'max') {
            return intl.formatMessage(
                messages.rule[
                    rule as Exclude<
                        typeof rule,
                        | 'min'
                        | 'max'
                        | 'minLength'
                        | 'maxLength'
                        | 'minItems'
                        | 'maxItems'
                        | 'cropRatios'
                    >
                ],
            );
        }
        return intl.formatMessage(messages.rule.invalid);
    };
}
