import { Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { isFilled } from '@panneau/protocol/runtime';
import { Fieldset, Icon, SegmentedControl, usePanneauIntl } from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps } from '../shared/entry';
import { messages } from '../shared/messages';
import { useRevealer } from '../shared/reveal';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './LocalizedField.module.css';

/** A localized value: a value per locale (`{ fr: 'Été', en: 'Summer' }`). */
export type LocalizedValue<V> = Partial<Record<string, V | null>>;

/** What `LocalizedField` gives the input of each locale. */
export interface LocalizedInputProps<V> {
    locale: string;
    /**
     * Name of the locale in the UI's language. The field shows the locales: give it to the input
     * as its `aria-label`, not as a visible label.
     */
    label: string;
    value: V | null;
    onChange: (value: V | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

export interface LocalizedFieldProps<V> extends FieldProps<LocalizedValue<V>> {
    /** Locales, in order. The first one shows first. */
    locales: readonly string[];
    /** Renders the input of a locale. */
    children: (props: LocalizedInputProps<V>) => ReactNode;
    /** The locale shown. Controlled with `onLocaleChange`. */
    locale?: string;
    onLocaleChange?: (locale: string) => void;
    /** Locales whose value has errors: their switch shows it. */
    invalidLocales?: readonly string[];
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
 * A value per locale: one locale at a time, under the field's label, with a switch at the end of
 * the label's line for the others. The switch marks the locales in error, and the empty ones: to
 * fill in when the field is required, to add otherwise. A value without any locale filled is
 * `null`.
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
    locale,
    onLocaleChange,
    invalidLocales = [],
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    localeClassName,
}: LocalizedFieldProps<V>) {
    const intl = usePanneauIntl();
    const localeName = useLocaleName();
    const [uncontrolled, setUncontrolled] = useState(locales[0]);
    const wanted = locale ?? uncontrolled;
    const current = wanted !== undefined && locales.includes(wanted) ? wanted : locales[0];

    const options = locales.map((option, index) => {
        const name = localeName(option);
        const invalid = invalidLocales.includes(option);
        const empty = !isFilled(value?.[option]);
        // An empty locale after the first is a translation to add, unless every locale is required.
        const addable = !invalid && empty && required !== true && index > 0;
        let textValue = name;
        if (invalid) {
            textValue = intl.formatMessage(messages.localeInvalid, { locale: name });
        } else if (addable) {
            textValue = intl.formatMessage(messages.addLocale, { locale: name });
        } else if (empty) {
            textValue = intl.formatMessage(messages.localeEmpty, { locale: name });
        }
        return {
            value: option,
            textValue,
            label: (
                <span className={styles.option}>
                    {addable ? <Icon icon={Plus} size="sm" /> : null}
                    {option.toUpperCase()}
                    {invalid ? <span className={cx(styles.marker, styles.invalid)} /> : null}
                    {!invalid && empty && required === true ? (
                        <span className={cx(styles.marker, styles.empty)} />
                    ) : null}
                </span>
            ),
        };
    });

    return (
        <Fieldset
            legend={label}
            legendEnd={
                locales.length > 1 ? (
                    <SegmentedControl
                        size="sm"
                        aria-label={intl.formatMessage(messages.locales)}
                        options={options}
                        {...(current !== undefined ? { value: current } : {})}
                        onChange={(next) => {
                            setUncontrolled(next);
                            onLocaleChange?.(next);
                        }}
                    />
                ) : undefined
            }
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {locales.map((option) => (
                // Every locale stays mounted: inputs keep their state, and errors can be revealed.
                <div
                    key={option}
                    className={cx(styles.locale, localeClassName)}
                    hidden={option !== current}
                >
                    {children({
                        locale: option,
                        label: localeName(option),
                        value: value?.[option] ?? null,
                        onChange: (next) => {
                            const updated = { ...value, [option]: next };
                            const filled = Object.values(updated).some(
                                (entry) => entry !== null && entry !== undefined && entry !== '',
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
        </Fieldset>
    );
}

/** The locale of a path inside a localized field (`title.en`, `body.en.0` in `title`), if any. */
function localeOf(path: string, fieldPath: string, locales: readonly string[]) {
    return locales.find(
        (locale) => path === `${fieldPath}.${locale}` || path.startsWith(`${fieldPath}.${locale}.`),
    );
}

/**
 * A field of the definition with `localized: true`: the field of its type for each locale of the
 * fields context, each at its own path (`title.fr`). It shows the locale of a path the form
 * reveals, such as the first error on submit.
 */
export function LocalizedFieldEntry(props: FieldEntryProps) {
    const { locales: contextLocales } = useFieldsContext();
    const { field, path, value } = props;
    const record =
        value !== null && typeof value === 'object' && !Array.isArray(value)
            ? (value as Record<string, unknown>)
            : {};
    const locales = contextLocales.length > 0 ? contextLocales : Object.keys(record);
    const [locale, setLocale] = useState(locales[0]);
    useRevealer((revealed) => {
        const found = localeOf(revealed, path, locales);
        if (found !== undefined) {
            setLocale(found);
        }
    });
    const invalidLocales = locales.filter((candidate) =>
        (props.invalidPaths ?? []).some(
            (invalid) => localeOf(invalid, path, [candidate]) !== undefined,
        ),
    );
    const { name: _name, onBlur: _onBlur, ...chrome } = getFieldProps(props);
    return (
        <LocalizedField<unknown>
            {...chrome}
            locales={locales}
            value={record}
            onChange={props.onChange}
            {...(locale !== undefined ? { locale } : {})}
            onLocaleChange={setLocale}
            invalidLocales={invalidLocales}
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
                    hideLabel
                    {...(props.disabled !== undefined ? { disabled: props.disabled } : {})}
                    {...(props.readOnly !== undefined ? { readOnly: props.readOnly } : {})}
                />
            )}
        </LocalizedField>
    );
}
