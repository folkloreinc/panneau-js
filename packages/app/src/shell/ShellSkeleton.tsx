import { appMessages } from '@panneau/intl';
import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { usePreference } from '../preferences';
import { SIDEBAR_STATES } from './AppLayout';
import layoutStyles from './AppLayout.module.css';
import styles from './ShellSkeleton.module.css';

/** Widths of the links of the sidebar, varied so they read as labels. */
const LINKS = ['70%', '55%', '80%', '45%', '60%', '50%'];

/**
 * The app at boot, before the definition (decision 0034): the frame of the app, with its sidebar,
 * collapsed if the user left it so, and a page header, in the layout of `AppLayout`.
 */
export function ShellSkeleton() {
    const intl = usePanneauIntl();
    const [sidebar] = usePreference('sidebar', SIDEBAR_STATES);
    const collapsed = sidebar === 'collapsed';
    return (
        <LoadingRegion
            label={intl.formatMessage(appMessages.loading)}
            className={cx(layoutStyles.layout, collapsed && layoutStyles.collapsed)}
        >
            <div className={layoutStyles.topBar}>
                <Skeleton shape="rect" width="2.25rem" height="2.25rem" />
                <Skeleton width="8rem" />
            </div>
            <div className={layoutStyles.sidebar}>
                <div className={styles.sidebar}>
                    <div className={styles.brand}>
                        <Skeleton shape="rect" width="1.75rem" height="1.75rem" />
                        {collapsed ? null : <Skeleton width="60%" />}
                    </div>
                    <Skeleton shape="rect" height="var(--panneau-control-height-sm)" />
                    <div className={styles.links}>
                        {LINKS.map((width, index) => (
                            <div key={index} className={styles.link}>
                                <Skeleton shape="rect" width="1rem" height="1rem" />
                                {collapsed ? null : <Skeleton width={width} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={layoutStyles.main}>
                <div className={layoutStyles.panel}>
                    <div className={styles.page}>
                        <Skeleton className={styles.title} width="16rem" />
                        <Skeleton lines={2} width="min(32rem, 100%)" />
                    </div>
                </div>
            </div>
        </LoadingRegion>
    );
}
