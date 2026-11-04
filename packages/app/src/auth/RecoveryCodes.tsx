import { useState } from 'react';

import { appMessages } from '@panneau/intl';
import { Alert, Button, usePanneauIntl } from '@panneau/ui';

import styles from './LoginPage.module.css';

/**
 * Recovery codes of two-factor authentication, shown once when they are made (decision 0049),
 * with a button that copies them.
 */
export function RecoveryCodes({ codes }: { codes: readonly string[] }) {
    const intl = usePanneauIntl();
    const [copied, setCopied] = useState(false);
    const copy = () => {
        void navigator.clipboard.writeText(codes.join('\n')).then(() => setCopied(true));
    };
    return (
        <div className={styles.section}>
            <Alert tone="warning">{intl.formatMessage(appMessages.recoveryCodesHelp)}</Alert>
            <ul className={styles.codes} aria-label={intl.formatMessage(appMessages.recoveryCodes)}>
                {codes.map((code) => (
                    <li key={code}>{code}</li>
                ))}
            </ul>
            <Button onPress={copy} fullWidth>
                {intl.formatMessage(copied ? appMessages.codesCopied : appMessages.copyCodes)}
            </Button>
        </div>
    );
}
