import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { usePanneauIntl } from '@panneau/ui';

import styles from './frame.module.css';

/** The id of the main content of the frame, which the skip link goes to. */
export const CONTENT_ID = 'panneau-content';

/** The first link of the frame: keyboard users jump past the navigation to the content. */
export function SkipLink() {
    const intl = usePanneauIntl();
    return (
        <a href={`#${CONTENT_ID}`} className={styles.skipLink}>
            {intl.formatMessage(appMessages.skipToContent)}
        </a>
    );
}

/** The logo of the site, in the sidebar and the top bar: the first letter of its name. */
export function SiteLogo({ definition }: { definition: Definition }) {
    return (
        <span className={styles.logo} aria-hidden="true">
            {definition.name.charAt(0).toLocaleUpperCase(definition.locale)}
        </span>
    );
}
