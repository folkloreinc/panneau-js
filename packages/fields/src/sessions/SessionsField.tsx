import styles from '../compound/Compound.module.css';
import { type CompoundFieldEntry, defineCompoundField, restParts } from '../compound/compound';
import { formatDateRange, getDateRangeSettings } from '../daterange/range';
import { toReferences } from '../shared/relation';

const PLACED = ['dates', 'venue'];

/**
 * The `sessions` type (decision 0065): a compound field whose items are the `dates` of a session
 * (a `daterange`) and its `venue` (a relation). The definition gives the sub-fields: those of a
 * site (a price, a link to the tickets) come after these.
 */
export const SessionsFieldEntry: CompoundFieldEntry = defineCompoundField({
    layout: ({ parts }) => (
        <div className={styles.stack}>
            <div className={styles.row}>
                <div className={`${styles.part} ${styles.wide}`}>{parts.dates}</div>
                <div className={styles.part}>{parts.venue}</div>
            </div>
            {restParts(parts, PLACED).length > 0 ? (
                <div className={styles.row}>
                    {restParts(parts, PLACED).map((part, index) => (
                        <div key={index} className={styles.part}>
                            {part}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    ),
    summarize: (session, { field, locale }) => {
        const dates = field.fields?.find((part) => part.name === 'dates');
        const range = formatDateRange(
            session.dates,
            locale,
            getDateRangeSettings(dates?.settings).timeZone,
        );
        const venue = toReferences(session.venue)[0]?.label;
        const texts = [range?.text, venue].filter(
            (text): text is string => text !== undefined && text !== '',
        );
        return texts.length > 0 ? texts.join(' · ') : null;
    },
});

/** The `sessions` type, as a `@panneau/core` plugin. */
export const sessionsPlugin = {
    id: 'panneau.sessions',
    fields: { sessions: SessionsFieldEntry },
};
