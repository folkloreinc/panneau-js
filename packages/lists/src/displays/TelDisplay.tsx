import { getCountryFlag } from '@panneau/fields/country';
import { parsePhone, splitExtension } from '@panneau/fields/tel';
import { usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { DisplayProps } from '../types';
import styles from './Displays.module.css';
import { EmptyValue } from './displays';

/**
 * A link that calls the phone number: the flag of its country and the number in its international
 * format (`+1 514 555 0199`), with its extension (`, ext. 123`) when its field allows one
 * (`settings.extension`) or the column has no field. A value that isn't E.164 shows as it is.
 */
export function TelDisplay({ value, field }: DisplayProps) {
    const intl = usePanneauIntl();
    if (typeof value !== 'string' || value.trim() === '') {
        return <EmptyValue />;
    }
    const { number: text, extension } =
        field === null || field.settings?.extension === true
            ? splitExtension(value)
            : { number: value, extension: null };
    const number = parsePhone(text);
    if (number === null) {
        return (
            <a className={styles.link} href={`tel:${value.replace(/[^\d+]/g, '')}`}>
                {value}
            </a>
        );
    }
    return (
        <a
            className={`${styles.link} ${styles.flagged}`}
            href={`tel:${number.number}${extension !== null ? `;ext=${extension}` : ''}`}
        >
            {number.country !== null ? (
                <span className={styles.flag} aria-hidden="true">
                    {getCountryFlag(number.country)}
                </span>
            ) : null}
            {extension !== null
                ? intl.formatMessage(messages.phoneExtension, {
                      number: number.international,
                      extension,
                  })
                : number.international}
        </a>
    );
}
