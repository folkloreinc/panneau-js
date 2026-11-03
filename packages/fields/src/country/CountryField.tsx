import { usePanneauIntl } from '@panneau/ui';

import { CodeComboBox } from '../shared/CodeComboBox';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { getCountryChoices } from './countries';

export interface CountryFieldProps extends FieldProps<string> {
    /** The codes to offer. All countries without it. */
    countries?: readonly string[];
    /** Codes shown first, in their order, above the others: `['CA', 'US']`. */
    preferred?: readonly string[];
    placeholder?: string;
    controlClassName?: string;
}

/**
 * A country, as its ISO 3166-1 alpha-2 code (`CA`): a combo box of the countries with their flags
 * and their names in the user's locale. Typing filters them by name or by code.
 */
export function CountryField({ countries, preferred, placeholder, ...props }: CountryFieldProps) {
    const intl = usePanneauIntl();
    const choices = getCountryChoices(intl.locale, { countries, preferred });
    return (
        <CodeComboBox
            {...props}
            choices={[...choices.preferred, ...choices.others].map((country) => ({
                code: country.code,
                name: country.name,
                prefix: country.flag,
            }))}
            placeholder={placeholder ?? intl.formatMessage(messages.countryPlaceholder)}
            emptyMessage={intl.formatMessage(messages.noCountries)}
        />
    );
}

const isCodes = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);

/** The `country` type: `settings.countries` and `settings.preferred`. */
export function CountryFieldEntry(props: FieldEntryProps) {
    const countries = getSetting(props.field, 'countries', isCodes);
    const preferred = getSetting(props.field, 'preferred', isCodes);
    return (
        <CountryField
            {...getFieldProps(props)}
            {...(countries !== undefined ? { countries } : {})}
            {...(preferred !== undefined ? { preferred } : {})}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
