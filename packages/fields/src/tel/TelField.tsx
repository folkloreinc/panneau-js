import { useState } from 'react';

import { Select, usePanneauIntl } from '@panneau/ui';

import { getCountryFlag, getCountryName, getLocaleCountry } from '../country/countries';
import { getFieldProps, getSetting, isBoolean, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import styles from './TelField.module.css';
import {
    MAX_EXTENSION_LENGTH,
    formatPhoneInput,
    getCallingCode,
    getPhoneCountries,
    joinExtension,
    parsePhone,
    readExtension,
    readPhone,
    splitExtension,
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
    /**
     * Adds an input for the extension, after the number. The value is then the number with its
     * extension after `;ext=`, as in a `tel:` URI: `+15145550199;ext=123`.
     */
    extension?: boolean;
}

/** Characters that aren't part of a number: an extension typed after it (`x123`, `ext. 123`). */
const NOT_A_NUMBER = /[^\d\s()+.-]/;

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
 *
 * With `extension`, an input after the number takes the digits of an extension, kept after `;ext=`
 * (`+15145550199;ext=123`). An extension typed or pasted after the number (`ext. 123`, `x123`,
 * `poste 123`) moves to that input when the field is left.
 */
export function TelField({
    value,
    onChange,
    onBlur,
    country: defaultCountry,
    extension: allowsExtension = false,
    suffix,
    disabled,
    readOnly,
    ...props
}: TelFieldProps) {
    const intl = usePanneauIntl();
    // The country picked in the menu, or found in a number typed with its calling code.
    const [chosen, setChosen] = useState<string | null>(null);
    // The text being typed, while the input has the focus.
    const [draft, setDraft] = useState<string | null>(null);
    // Without extensions, a value is a number as it is, even with `;ext=`: the rule refuses it.
    const parts = allowsExtension
        ? splitExtension(value)
        : { number: value ?? null, extension: null };
    const number = parsePhone(parts.number);
    const country =
        number?.country ?? chosen ?? defaultCountry ?? getLocaleCountry(intl.locale) ?? null;
    const shown = draft ?? display(parts.number, country);

    const emit = (next: string | null) => {
        if (next !== (value ?? null)) {
            onChange?.(next);
        }
    };
    /** A number, with the extension of the value, or another one. */
    const emitNumber = (next: string | null, extension?: string | null) => {
        emit(joinExtension(next, extension === undefined ? parts.extension : extension));
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
                emitNumber(readPhone(digits, code).value);
            }}
        />
    );

    const extensionInput = allowsExtension ? (
        <span className={styles.extension}>
            <span aria-hidden="true">{intl.formatMessage(messages.telExtensionShort)}</span>
            <input
                className={styles.extensionInput}
                type="text"
                inputMode="numeric"
                autoComplete="tel-extension"
                aria-label={intl.formatMessage(messages.telExtension)}
                aria-invalid={(props.errors?.length ?? 0) > 0 || undefined}
                maxLength={MAX_EXTENSION_LENGTH}
                value={parts.extension ?? ''}
                disabled={disabled}
                readOnly={readOnly}
                onChange={(event) => {
                    // Digits only: other characters are left out as they are typed.
                    const digits = event.target.value
                        .replace(/\D/g, '')
                        .slice(0, MAX_EXTENSION_LENGTH);
                    emitNumber(parts.number, digits === '' ? null : digits);
                }}
                onBlur={() => onBlur?.()}
            />
        </span>
    ) : null;

    return (
        <TextField
            autoComplete="tel"
            {...props}
            disabled={disabled}
            readOnly={readOnly}
            type="tel"
            inputMode="tel"
            prefix={picker}
            {...(extensionInput !== null || suffix !== undefined
                ? {
                      suffix: (
                          <>
                              {extensionInput}
                              {suffix}
                          </>
                      ),
                  }
                : {})}
            value={shown}
            onChange={(text) => {
                const typed = text ?? '';
                // An extension typed after the number stays as typed until the field is left.
                const typedExtension = allowsExtension && NOT_A_NUMBER.test(typed);
                // Characters added at the end are formatted as they are typed; other edits stay as
                // they are, so that the cursor doesn't jump. With extensions, a space typed after
                // the number stays, before `ext.` or `x`.
                const added = typed.startsWith(shown) ? typed.slice(shown.length) : '';
                const next =
                    !typedExtension && added !== '' && !(allowsExtension && added.trim() === '')
                        ? formatPhoneInput(typed, country)
                        : typed;
                setDraft(next);
                if (typedExtension) {
                    emitNumber(next.trim());
                    return;
                }
                const read = readPhone(next, country);
                if (read.country !== null && read.country !== country) {
                    setChosen(read.country);
                }
                emitNumber(read.value);
            }}
            onBlur={() => {
                setDraft(null);
                // A number as typed becomes E.164 when it reads as a number of the country, and an
                // extension typed after it moves to its input, unless the field can't be changed.
                if (
                    readOnly !== true &&
                    disabled !== true &&
                    isString(parts.number) &&
                    parsePhone(parts.number) === null
                ) {
                    const typed = allowsExtension ? readExtension(parts.number) : null;
                    emitNumber(
                        readPhone(typed?.number ?? parts.number, country).value,
                        typed?.extension ?? parts.extension,
                    );
                }
                onBlur?.();
            }}
        />
    );
}

/**
 * The `tel` type: `settings.country` is the country of a new number, and `settings.extension` adds
 * an input for an extension.
 */
export function TelFieldEntry(props: FieldEntryProps) {
    const country = getSetting(props.field, 'country', isString);
    const extension = getSetting(props.field, 'extension', isBoolean) === true;
    return (
        <TelField
            {...getFieldProps(props)}
            {...(country !== undefined ? { country } : {})}
            {...(extension ? { extension } : {})}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
