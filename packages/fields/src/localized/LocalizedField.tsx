import type { ReactNode } from 'react';

import { Fieldset, usePanneauIntl } from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './LocalizedField.module.css';

/** A localized value: a value per locale (`{ fr: 'Été', en: 'Summer' }`). */
export type LocalizedValue<V> = Partial<Record<string, V | null>>;

/** What `LocalizedField` gives the input of each locale. */
export interface LocalizedInputProps<V> {
    locale: string;
    /** Name of the locale in the UI's language, as the input's label. */
    label: string;
    value: V | null;
    onChange: (value: V | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

export interface LocalizedFieldProps<V> extends FieldProps<LocalizedValue<V>> {
    /** Locales, in order. */
    locales: readonly string[];
    /** Renders the input of a locale. */
    children: (props: LocalizedInputProps<V>) => ReactNode;
    localeClassName?: string;
}

/** The name of a locale in the UI's language, capitalized (`Français`, `English`). */
export function useLocaleName(): (locale: string) => string {
    const intl = usePanneauIntl();
    return (locale) => {
        let name: string | undefined;
        try {
            name = intl.formatDisplayName(locale, { type: 'language' });
        } catch {
            name = undefined;
        }
        const text = name ?? locale.toUpperCase();
        return text.charAt(0).toLocaleUpperCase(intl.locale) + text.slice(1);
    };
}

/**
 * A value per locale, with an input for each locale under one legend. A value without any locale
 * filled is `null`.
 */
export function LocalizedField<V>({
    locales,
    children,
    value,
    onChange,
    onBlur,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    localeClassName,
}: LocalizedFieldProps<V>) {
    const localeName = useLocaleName();
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            <div className={styles.locales}>
                {locales.map((locale) => (
                    <div key={locale} className={cx(styles.locale, localeClassName)}>
                        {children({
                            locale,
                            label: localeName(locale),
                            value: value?.[locale] ?? null,
                            onChange: (next) => {
                                const updated = { ...value, [locale]: next };
                                const filled = Object.values(updated).some(
                                    (entry) =>
                                        entry !== null && entry !== undefined && entry !== '',
                                );
                                onChange?.(filled ? updated : null);
                            },
                            ...(onBlur !== undefined ? { onBlur } : {}),
                            ...(disabled !== undefined ? { disabled } : {}),
                            ...(readOnly !== undefined ? { readOnly } : {}),
                            ...(required !== undefined ? { required } : {}),
                        })}
                    </div>
                ))}
            </div>
        </Fieldset>
    );
}

/**
 * A field of the definition with `localized: true`: the field of its type for each locale of the
 * fields context, each at its own path (`title.fr`).
 */
export function LocalizedFieldEntry(props: FieldEntryProps) {
    const { locales: contextLocales } = useFieldsContext();
    const { field, path, value } = props;
    const record =
        value !== null && typeof value === 'object' && !Array.isArray(value)
            ? (value as Record<string, unknown>)
            : {};
    const locales = contextLocales.length > 0 ? contextLocales : Object.keys(record);
    const { name: _name, onBlur: _onBlur, ...chrome } = getFieldProps(props);
    return (
        <LocalizedField<unknown>
            {...chrome}
            locales={locales}
            value={record}
            onChange={props.onChange}
        >
            {(input) => (
                <NestedField
                    field={{ ...field, localized: false, label: input.label, help: undefined }}
                    path={`${path}.${input.locale}`}
                    value={input.value}
                    onChange={input.onChange}
                    {...(props.onBlur !== undefined ? { onBlur: props.onBlur } : {})}
                    parentValue={props.parentValue}
                    locale={input.locale}
                    {...(props.disabled !== undefined ? { disabled: props.disabled } : {})}
                    {...(props.readOnly !== undefined ? { readOnly: props.readOnly } : {})}
                />
            )}
        </LocalizedField>
    );
}
