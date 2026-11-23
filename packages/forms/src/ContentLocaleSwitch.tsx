import { useId } from 'react';

import { type Form, useFormSelector } from '@panneau/core';
import { useLocaleName } from '@panneau/fields/localized';
import type { Field } from '@panneau/protocol';
import { SegmentedControl, usePanneauIntl } from '@panneau/ui';

import styles from './Form.module.css';
import { getLocaleMarks } from './contentLocale';
import { cx } from './cx';
import { messages } from './messages';

export interface ContentLocaleSwitchProps {
    form: Form;
    /** The fields of the form, resolved in its mode. */
    fields: readonly Field[];
    locales: readonly string[];
    locale: string;
    onChange: (locale: string) => void;
    className?: string;
}

/**
 * The language switch of a form: the locale of every localized field in it. Each locale says
 * whether its values have errors, or miss required ones, from the form's state.
 */
export function ContentLocaleSwitch({
    form,
    fields,
    locales,
    locale,
    onChange,
    className,
}: ContentLocaleSwitchProps) {
    const intl = usePanneauIntl();
    const localeName = useLocaleName();
    const labelId = useId();
    // The marks as a string (`i-,-m`), so that the switch renders again only when one changes
    const encoded = useFormSelector(form, (state) => {
        const marks = getLocaleMarks(state, fields, locales);
        return locales
            .map(
                (option) =>
                    `${marks[option]?.invalid ? 'i' : '-'}${marks[option]?.missing ? 'm' : '-'}`,
            )
            .join(',');
    });
    const flags = encoded.split(',');
    const options = locales.map((option, index) => {
        const name = localeName(option);
        const invalid = flags[index]?.startsWith('i') === true;
        const missing = !invalid && flags[index]?.endsWith('m') === true;
        let textValue = name;
        if (invalid) {
            textValue = intl.formatMessage(messages.contentLocaleInvalid, { locale: name });
        } else if (missing) {
            textValue = intl.formatMessage(messages.contentLocaleMissing, { locale: name });
        }
        return {
            value: option,
            textValue,
            label: (
                <span className={styles.localeOption}>
                    {name}
                    {invalid ? (
                        <span className={cx(styles.localeMarker, styles.localeInvalid)} />
                    ) : null}
                    {missing ? (
                        <span className={cx(styles.localeMarker, styles.localeMissing)} />
                    ) : null}
                </span>
            ),
        };
    });
    return (
        <div className={cx(styles.contentLocale, className)}>
            <span id={labelId} className={styles.contentLocaleLabel}>
                {intl.formatMessage(messages.contentLocale)}
            </span>
            <SegmentedControl
                size="sm"
                aria-labelledby={labelId}
                options={options}
                value={locale}
                onChange={onChange}
            />
        </div>
    );
}
