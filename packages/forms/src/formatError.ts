import { formatMoney } from '@panneau/fields/money';
import type { Field, RuleFailure } from '@panneau/protocol';
import { usePanneauIntl } from '@panneau/ui';

import { messages } from './messages';
import { getPathSteps } from './paths';

const COUNTED = new Set(['repeater', 'relation', 'media', 'select', 'country']);

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
        if ((failure.rule === 'min' || failure.rule === 'max') && field?.type === 'money') {
            // An amount in minor units, in the currency of the field (decision 0053).
            const currency = field.settings?.currency;
            const amount =
                formatMoney(
                    { amount: value, currency: typeof currency === 'string' ? currency : null },
                    intl.locale,
                ) ?? String(value);
            return intl.formatMessage(
                failure.rule === 'min' ? messages.rule.minAmount : messages.rule.maxAmount,
                { value: amount },
            );
        }
        if (failure.rule === 'daterange') {
            return intl.formatMessage(
                failure.value === 'start'
                    ? messages.rule.daterangeStart
                    : failure.value === 'end'
                      ? messages.rule.daterangeEnd
                      : messages.rule.daterangeOrder,
            );
        }
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
        if (failure.rule === 'providers') {
            const providers = Array.isArray(failure.value)
                ? failure.value.filter((name): name is string => typeof name === 'string')
                : [];
            return intl.formatMessage(messages.rule.providers, {
                providers: intl.formatList(providers, { type: 'disjunction' }),
            });
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
                        | 'providers'
                        | 'minAmount'
                        | 'maxAmount'
                    >
                ],
            );
        }
        return intl.formatMessage(messages.rule.invalid);
    };
}
