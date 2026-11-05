import styles from '../compound/Compound.module.css';
import { type CompoundFieldEntry, defineCompoundField, restParts } from '../compound/compound';
import { formatCredit } from './credits';

const PLACED = ['person', 'name', 'roles', 'featured'];

/**
 * The `credits` type (decision 0065): a compound field whose items are a person (`person`, a
 * relation) or a free name (`name`), their `roles`, and whether the credit is `featured`. The
 * definition gives the sub-fields: those of a site come after these.
 */
export const CreditsFieldEntry: CompoundFieldEntry = defineCompoundField({
    layout: ({ parts }) => (
        <div className={styles.stack}>
            <div className={styles.row}>
                <div className={styles.part}>{parts.person}</div>
                <div className={styles.part}>{parts.name}</div>
                <div className={styles.part}>{parts.roles}</div>
            </div>
            {parts.featured !== undefined ? (
                <div className={styles.part}>{parts.featured}</div>
            ) : null}
            {restParts(parts, PLACED).map((part, index) => (
                <div key={index} className={styles.part}>
                    {part}
                </div>
            ))}
        </div>
    ),
    summarize: (credit, { locale }) => formatCredit(credit, locale),
});

/** The `credits` type, as a `@panneau/core` plugin. */
export const creditsPlugin = {
    id: 'panneau.credits',
    fields: { credits: CreditsFieldEntry },
};
