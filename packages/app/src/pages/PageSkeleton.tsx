import { LoadingRegion, Skeleton } from '@panneau/ui';

import { PageLayout, type PageLayoutProps } from './PageHeader';
import styles from './PageSkeleton.module.css';

export interface PageSkeletonProps {
    /** The width of the page that loads. */
    width?: PageLayoutProps['width'];
    /** The blocks of content under the title. */
    blocks?: number;
}

/**
 * A page of the app whose code loads, such as the account page (decision 0034): its title and
 * blocks of content, in the layout of the pages.
 */
export function PageSkeleton({ width = 'default', blocks = 2 }: PageSkeletonProps) {
    return (
        <PageLayout width={width}>
            <LoadingRegion className={styles.root}>
                <Skeleton className={styles.title} width="16rem" />
                {Array.from({ length: blocks }, (_, index) => (
                    <Skeleton key={index} shape="rect" height="6rem" />
                ))}
            </LoadingRegion>
        </PageLayout>
    );
}
