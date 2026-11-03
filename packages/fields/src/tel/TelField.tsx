import { useState } from 'react';

import { Select, usePanneauIntl } from '@panneau/ui';

import { getCountryFlag, getCountryName, getLocaleCountry } from '../country/countries';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import {
    formatPhoneInput,
    getCallingCode,
    getPhoneCountries,
    parsePhone,
    readPhone,
} from './phone';

export interface TelFieldProps extends Omit<
    TextFieldProps,
    'type' | 'inputMode' | 'prefix' | 'maxLength' | 'secret'
> {
    /**
     * The country of a new number (`CA`). Without it, the region of the user's locale (`fr-CA`
     * gives `CA`).
     */
    country?: string | null;
}

/** The text shown for a value: a number of the country in its format, any other as it is. */
function display(value: string | null | undefined, country: string | null): string {
    const number = parsePhone(value);
    if (number === null) {
        return value ?? '';
    }
    return number.country !== null && number.country === country
        ? number.national
        : number.international;
}

/**
 * A phone number, in E.164 (`+15145550199`). The country of the number, its flag and its calling
 * code, is in a menu at the start of the input, and the number shows in the format of its country
 * as it is typed. The country follows the number: typing `+33…` picks France.
 *
 * Until a number is complete, the value is the text as typed, which the `tel` rule refuses. A value
 * that isn't E.164, kept from before, shows as it is, and becomes E.164 when the field is left, if
 * it reads as a number of the chosen country.
 */
export function TelField({
    value,
    onChange,
    onBlur,
    country: defaultCountry,
    disabled,
    readOnly,
    ...props
}: TelFieldProps) {
    const intl = usePanneauIntl();
    // The country picked in the menu, or found in a number typed with its calling code.
    const [chosen, setChosen] = useState<string | null>(null);
    // The text being typed, while the input has the focus.
    const [draft, setDraft] = useState<string | null>(null);
    const number = parsePhone(value);
    const country =
        number?.country ?? chosen ?? defaultCountry ?? getLocaleCountry(intl.locale) ?? null;
    const shown = draft ?? display(value, country);

    const emit = (next: string | null) => {
        if (next !== (value ?? null)) {
            onChange?.(next);
        }
    };

    const collator = new Intl.Collator(intl.locale);
    const countries = getPhoneCountries()
        .map((code) => ({ code, name: getCountryName(code, intl.locale) }))
        .sort((a, b) => collator.compare(a.name, b.name));

    const picker = (
        <Select
            aria-label={intl.formatMessage(messages.telCountry)}
            appearance="bare"
            isRequired
            isDisabled={disabled === true || readOnly === true}
            placeholder="+"
            options={countries.map(({ code, name }) => ({
                value: code,
                label: `${name} +${getCallingCode(code) ?? ''}`,
                prefix: getCountryFlag(code),
            }))}
            value={country}
            renderValue={(option) => `+${getCallingCode(String(option.value)) ?? ''}`}
            onChange={(next) => {
                const code = next !== null ? String(next) : null;
                setChosen(code);
                setDraft(null);
                // The same digits, in the country picked.
                const digits = number?.nationalNumber ?? shown.replace(/^\+/, '');
                emit(readPhone(digits, code).value);
            }}
        />
    );

    return (
        <TextField
            autoComplete="tel"
            {...props}
            disabled={disabled}
            readOnly={readOnly}
            type="tel"
            inputMode="tel"
            prefix={picker}
            value={shown}
            onChange={(text) => {
                const typed = text ?? '';
                // Characters added at the end are formatted as they are typed; other edits stay as
                // they are, so that the cursor doesn't jump.
                const next =
                    typed.length > shown.length && typed.startsWith(shown)
                        ? formatPhoneInput(typed, country)
                        : typed;
                setDraft(next);
                const read = readPhone(next, country);
                if (read.country !== null && read.country !== country) {
                    setChosen(read.country);
                }
                emit(read.value);
            }}
            onBlur={() => {
                setDraft(null);
                // A value as typed becomes E.164 when it reads as a number of the country, unless
                // the field can't be changed.
                if (
                    readOnly !== true &&
                    disabled !== true &&
                    isString(value) &&
                    parsePhone(value) === null
                ) {
                    emit(readPhone(value, country).value);
                }
                onBlur?.();
            }}
        />
    );
}

/** The `tel` type: `settings.country` is the country of a new number. */
export function TelFieldEntry(props: FieldEntryProps) {
    const country = getSetting(props.field, 'country', isString);
    return (
        <TelField
            {...getFieldProps(props)}
            {...(country !== undefined ? { country } : {})}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
