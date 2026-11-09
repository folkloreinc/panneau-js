import { appMessages } from '@panneau/intl';
import { LoadingRegion, Skeleton, usePanneauIntl, usePreference } from '@panneau/ui';

import { cx } from '../cx';
import { SIDEBAR_STATES } from './AppLayout';
import layoutStyles from './AppLayout.module.css';
import dockStyles from './Dock.module.css';
import dockLayoutStyles from './DockLayout.module.css';
import styles from './ShellSkeleton.module.css';

/** Widths of the links of the sidebar, varied so they read as labels. */
const LINKS = ['70%', '55%', '80%', '45%', '60%', '50%'];

/** The items of the dock while the app boots. */
const DOCK_ITEMS = 5;

export interface ShellSkeletonProps {
    /**
     * Where the navigation goes, from the definition's theme when the boot config has it
     * (decision 0076). Defaults to the sidebar.
     */
    navigation?: 'sidebar' | 'dock';
}

function PageSkeleton({ className }: { className: string | undefined }) {
    return (
        <div className={className}>
            <div className={styles.page}>
                <Skeleton className={styles.title} width="16rem" />
                <Skeleton lines={2} width="min(32rem, 100%)" />
            </div>
        </div>
    );
}

/** The app at boot with a dock: the bar at the top, a page header and the dock. */
function DockSkeleton({ label }: { label: string }) {
    return (
        <LoadingRegion label={label} className={dockLayoutStyles.layout}>
            <div className={dockLayoutStyles.topBar}>
                <div className={styles.brand}>
                    <Skeleton shape="rect" width="1.75rem" height="1.75rem" />
                    <Skeleton width="8rem" />
                </div>
            </div>
            <div className={dockLayoutStyles.main}>
                <PageSkeleton className={dockLayoutStyles.panel} />
            </div>
            <div className={dockLayoutStyles.dockArea}>
                <div className={cx(dockStyles.dock, dockLayoutStyles.dock)}>
                    <div className={cx(dockStyles.list, styles.dockItems)}>
                        {Array.from({ length: DOCK_ITEMS }, (_, index) => (
                            <div key={index} className={cx(dockStyles.item, styles.dockItem)}>
                                <Skeleton shape="rect" width="1.25rem" height="1.25rem" />
                                <Skeleton width="2.5rem" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LoadingRegion>
    );
}

/**
 * The app at boot, before the definition (decision 0034): the frame of the app, with its sidebar,
 * collapsed if the user left it so, and a page header, in the layout of `AppLayout`. With
 * `navigation: "dock"`, the frame of `DockLayout`.
 */
export function ShellSkeleton({ navigation = 'sidebar' }: ShellSkeletonProps) {
    const intl = usePanneauIntl();
    const [sidebar] = usePreference('sidebar', SIDEBAR_STATES);
    const collapsed = sidebar === 'collapsed';
    if (navigation === 'dock') {
        return <DockSkeleton label={intl.formatMessage(appMessages.loading)} />;
    }
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
                <PageSkeleton className={layoutStyles.panel} />
            </div>
        </LoadingRegion>
    );
}
