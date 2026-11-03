import { Layers } from 'lucide-react';

import { appMessages } from '@panneau/intl';
import { Heading, Icon, usePanneauIntl } from '@panneau/ui';

import { useDocumentTitle } from '../documentTitle';
import { ContextPicker } from '../shell/ContextPicker';
import styles from './ContextPage.module.css';

/**
 * The page in place of every route while a required param of the context has no value
 * (decision 0045): the fields to pick it, and the params before it.
 */
export function ContextPage() {
    const intl = usePanneauIntl();
    const title = intl.formatMessage(appMessages.contextRequired);
    useDocumentTitle([title]);
    return (
        <div className={styles.root}>
            <span className={styles.icon} aria-hidden="true">
                <Icon icon={Layers} size="lg" />
            </span>
            <Heading level={1}>{title}</Heading>
            <p className={styles.text}>{intl.formatMessage(appMessages.contextRequiredText)}</p>
            <ContextPicker missing className={styles.picker} />
        </div>
    );
}
