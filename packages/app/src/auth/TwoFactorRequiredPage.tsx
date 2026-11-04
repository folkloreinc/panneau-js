import { appMessages } from '@panneau/intl';
import { Button, usePanneauIntl } from '@panneau/ui';

import { AuthLayout } from './AuthLayout';
import styles from './LoginPage.module.css';
import { TwoFactorSetup, type TwoFactorSetupProps } from './TwoFactorSetup';

export interface TwoFactorRequiredPageProps extends TwoFactorSetupProps {
    name?: string;
    /** Logs out. Without it, the page has no button to log out. */
    onLogOut?: () => void;
}

/**
 * The page of a user who must have two-factor authentication and hasn't set it up, when the
 * backend refuses them with its problem (decision 0049): the setup, then the app.
 */
export function TwoFactorRequiredPage({ name, onLogOut, ...setup }: TwoFactorRequiredPageProps) {
    const intl = usePanneauIntl();
    return (
        <AuthLayout name={name} title={intl.formatMessage(appMessages.setUpTwoFactor)}>
            <p className={styles.help}>{intl.formatMessage(appMessages.twoFactorRequiredHelp)}</p>
            <TwoFactorSetup {...setup} />
            {onLogOut !== undefined ? (
                <Button appearance="ghost" onPress={onLogOut} fullWidth>
                    {intl.formatMessage(appMessages.logOut)}
                </Button>
            ) : null}
        </AuthLayout>
    );
}
