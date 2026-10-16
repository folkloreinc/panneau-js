import { Search } from 'lucide-react';

import { Icon, TextInput, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import { useDraft } from '../useDraft';
import styles from './Toolbar.module.css';

export interface SearchFieldProps {
    /** The search of the query. */
    value: string;
    /** Called once the user stops typing, or presses Enter. */
    onChange: (q: string) => void;
}

/** The search of a list (`q`). */
export function SearchField({ value, onChange }: SearchFieldProps) {
    const intl = usePanneauIntl();
    const { draft, setDraft, flush } = useDraft(value, onChange);
    return (
        <TextInput
            type="search"
            aria-label={intl.formatMessage(messages.search)}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            prefix={<Icon icon={Search} />}
            value={draft}
            onChange={setDraft}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    flush();
                }
            }}
            className={styles.search}
        />
    );
}
