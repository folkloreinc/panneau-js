import { X } from 'lucide-react';

import { Fieldset, IconButton, usePanneauIntl } from '@panneau/ui';

import { CodeComboBox } from '../shared/CodeComboBox';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './CountryField.module.css';
import { getCountryChoices, getCountryFlag, getCountryName, isCountryCode } from './countries';

/** Props of both single and multiple country fields. */
export interface CountryFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** The codes to offer. All countries without it. */
    countries?: readonly string[];
    /** Codes shown first, in their order, above the others: `['CA', 'US']`. */
    preferred?: readonly string[];
    placeholder?: string;
    controlClassName?: string;
}

export interface SingleCountryFieldProps extends CountryFieldBaseProps {
    multiple?: false;
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export interface MultipleCountryFieldProps extends CountryFieldBaseProps {
    /** Several countries, in the order they were chosen (decision 0058). */
    multiple: true;
    value?: readonly string[] | null;
    /** Called with the codes. An empty list is `null`. */
    onChange?: (value: string[] | null) => void;
}

export type CountryFieldProps = SingleCountryFieldProps | MultipleCountryFieldProps;

/**
 * A country, as its ISO 3166-1 alpha-2 code (`CA`): a combo box of the countries with their flags
 * and their names in the user's locale. Typing filters them by name or by code. With `multiple`,
 * several countries, each removable, in the order they were chosen, and the combo box adds one.
 */
export function CountryField(props: CountryFieldProps) {
    const intl = usePanneauIntl();
    const { countries, preferred } = props;
    const choices = getCountryChoices(intl.locale, { countries, preferred });
    const all = [...choices.preferred, ...choices.others].map((country) => ({
        code: country.code,
        name: country.name,
        prefix: country.flag,
    }));
    const emptyMessage = intl.formatMessage(messages.noCountries);

    if (props.multiple !== true) {
        const {
            multiple: _multiple,
            countries: _countries,
            preferred: _preferred,
            ...rest
        } = props;
        return (
            <CodeComboBox
                {...rest}
                choices={all}
                placeholder={props.placeholder ?? intl.formatMessage(messages.countryPlaceholder)}
                emptyMessage={emptyMessage}
            />
        );
    }

    const {
        value,
        onChange,
        onBlur,
        label,
        description,
        errors,
        disabled,
        readOnly,
        required,
        name,
        id,
        autoFocus,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        controlClassName,
    } = props;
    const codes = (value ?? []).filter(
        (code, index, list) => code !== '' && list.indexOf(code) === index,
    );
    const editable = disabled !== true && readOnly !== true;
    const set = (next: string[]) => onChange?.(next.length > 0 ? next : null);
    const nameOf = (code: string) =>
        isCountryCode(code) ? getCountryName(code, intl.locale) : code;
    const comboLabel = typeof label === 'string' ? label : props['aria-label'];
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors ?? []}
            isRequired={required}
            isDisabled={disabled}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            <div className={styles.multiple}>
                {codes.length > 0 ? (
                    <ul className={styles.countries}>
                        {codes.map((code) => (
                            <li
                                key={code}
                                className={editable ? styles.country : styles.fixedCountry}
                            >
                                {isCountryCode(code) ? (
                                    <span className={styles.flag} aria-hidden="true">
                                        {getCountryFlag(code)}
                                    </span>
                                ) : null}
                                <span className={styles.name}>{nameOf(code)}</span>
                                {editable ? (
                                    <IconButton
                                        icon={X}
                                        size="sm"
                                        label={`${intl.formatMessage(messages.remove)} ${nameOf(code)}`}
                                        showTooltip={false}
                                        onPress={() => set(codes.filter((entry) => entry !== code))}
                                    />
                                ) : null}
                            </li>
                        ))}
                    </ul>
                ) : null}
                <CodeComboBox
                    {...(comboLabel !== undefined ? { 'aria-label': comboLabel } : {})}
                    {...(name !== undefined ? { name } : {})}
                    {...(id !== undefined ? { id } : {})}
                    {...(autoFocus !== undefined ? { autoFocus } : {})}
                    {...(onBlur !== undefined ? { onBlur } : {})}
                    {...(controlClassName !== undefined ? { controlClassName } : {})}
                    disabled={disabled}
                    readOnly={readOnly}
                    choices={all.filter((choice) => !codes.includes(choice.code))}
                    value={null}
                    onChange={(code) => {
                        if (code !== null && !codes.includes(code)) {
                            set([...codes, code]);
                        }
                    }}
                    placeholder={props.placeholder ?? intl.formatMessage(messages.addCountry)}
                    emptyMessage={emptyMessage}
                />
            </div>
        </Fieldset>
    );
}

const isCodes = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);

/** The `country` type: `multiple`, `settings.countries` and `settings.preferred`. */
export function CountryFieldEntry(props: FieldEntryProps) {
    const countries = getSetting(props.field, 'countries', isCodes);
    const preferred = getSetting(props.field, 'preferred', isCodes);
    const shared = {
        ...getFieldProps(props),
        ...(countries !== undefined ? { countries } : {}),
        ...(preferred !== undefined ? { preferred } : {}),
    };
    if (props.field.multiple === true) {
        const codes = Array.isArray(props.value) ? props.value.filter(isString) : [];
        return (
            <CountryField
                {...shared}
                multiple
                value={codes.length > 0 ? codes : null}
                onChange={props.onChange}
            />
        );
    }
    return (
        <CountryField
            {...shared}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
