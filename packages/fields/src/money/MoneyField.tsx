import { useState } from 'react';

import { fromMinorUnits } from '@panneau/protocol/runtime';
import { NumberInput, Select, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getRuleNumber, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import {
    CURRENCY_CODES,
    type MoneyFieldValue,
    getCurrencyName,
    getMoneyFormatOptions,
    isMoneyValue,
    toMoneyValue,
} from './money';

export interface MoneyFieldProps extends FieldProps<MoneyFieldValue> {
    /** The currency of every amount (`CAD`): the field shows it, and can't change it. */
    currency?: string | null;
    /**
     * The currencies the user picks from, the first one for a new amount. Without `currency` or
     * `currencies`, every currency.
     */
    currencies?: readonly string[] | null;
    /** The smallest amount, in minor units. */
    min?: number;
    /** The largest amount, in minor units. */
    max?: number;
    placeholder?: string;
    controlClassName?: string;
    inputClassName?: string;
}

/**
 * An amount and its currency, `{ amount, currency }`, with the amount in minor units (decision
 * 0053): typed in the currency format of the locale, with the digits of the currency, and turned
 * into minor units without floating point errors. A fixed `currency` shows in the amount; otherwise
 * a menu after the amount picks it. Clearing the amount gives `null`.
 */
export function MoneyField({
    value,
    onChange,
    currency: fixed,
    currencies,
    min,
    max,
    disabled,
    readOnly,
    required,
    ...props
}: MoneyFieldProps) {
    const intl = usePanneauIntl();
    // The currency picked before an amount is typed: the value is still `null`.
    const [picked, setPicked] = useState<string | null>(null);
    const current = isMoneyValue(value) ? value : null;
    const choices =
        fixed !== undefined && fixed !== null
            ? []
            : currencies !== undefined && currencies !== null && currencies.length > 0
              ? currencies
              : CURRENCY_CODES;
    const currency =
        fixed ?? (current !== null ? current.currency : (picked ?? currencies?.[0] ?? null));
    const hasMenu = choices.length > 0;
    const toMajor = (amount: number) => fromMinorUnits(amount, currency ?? '');

    const menu = hasMenu ? (
        <Select
            aria-label={intl.formatMessage(messages.moneyCurrency)}
            appearance="bare"
            isRequired
            isDisabled={disabled === true || readOnly === true}
            placeholder={intl.formatMessage(messages.moneyCurrency)}
            options={choices.map((code) => ({
                value: code,
                label: `${code} – ${getCurrencyName(code, intl.locale)}`,
            }))}
            value={currency}
            renderValue={(option) => String(option.value)}
            onChange={(next) => {
                const code = next !== null ? String(next) : null;
                setPicked(code);
                if (current !== null) {
                    // The same amount, in the digits of the currency picked.
                    onChange?.(toMoneyValue(toMajor(current.amount), code));
                }
            }}
        />
    ) : undefined;

    return (
        <NumberInput
            {...props}
            value={current !== null ? toMajor(current.amount) : null}
            onChange={(next) => onChange?.(next === null ? null : toMoneyValue(next, currency))}
            formatOptions={getMoneyFormatOptions(currency, hasMenu ? 'narrowSymbol' : 'symbol')}
            {...(min !== undefined ? { minValue: toMajor(min) } : {})}
            {...(max !== undefined ? { maxValue: toMajor(max) } : {})}
            {...(menu !== undefined ? { suffix: menu } : {})}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `money` type: settings `currency` and `currencies`, `min` and `max` from its rules. */
export function MoneyFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const currency = getSetting(field, 'currency', isString);
    const currencies = getSetting(field, 'currencies', (value): value is string[] =>
        Array.isArray(value) ? value.every(isString) : false,
    );
    return (
        <MoneyField
            {...getFieldProps(props)}
            value={isMoneyValue(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(currency !== undefined ? { currency } : {})}
            {...(currencies !== undefined ? { currencies } : {})}
            {...(min !== undefined ? { min } : {})}
            {...(max !== undefined ? { max } : {})}
        />
    );
}
