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

/**
 * The image of the site's logo in its square, for when the definition isn't there yet: the
 * skeleton of the shell, with the logo of the boot config's definition.
 */
export function LogoImage({ src }: { src: string }) {
    return (
        <span className={styles.logo} aria-hidden="true">
            <img src={src} alt="" className={styles.logoImage} />
        </span>
    );
}

/**
 * The logo of the site, in the sidebar and the top bar: the image of the definition's `logo`, or
 * the first letter of its name.
 */
export function SiteLogo({ definition }: { definition: Definition }) {
    if (definition.logo !== undefined) {
        return <LogoImage src={definition.logo} />;
    }
    return (
        <span className={styles.logo} aria-hidden="true">
            {definition.name.charAt(0).toLocaleUpperCase(definition.locale)}
        </span>
    );
}
