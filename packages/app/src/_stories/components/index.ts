import type { ComponentsMap } from '@panneau/core';
import { PAGES_NAMESPACE, PREVIEWS_NAMESPACE } from '@panneau/core/contexts';

import DashboardPage from './DashboardPage';
import EventShowPage from './EventShowPage';
import JobListingPreview from './JobListingPreview';
import StatisticsPage from './StatisticsPage';

/**
 * Components given to the container. In the definition, the component names are
 * written in kebab case (ex: 'dashboard-page' -> DashboardPage).
 */
const components: ComponentsMap = {
    [PAGES_NAMESPACE]: {
        DashboardPage,
        EventShowPage,
        StatisticsPage,
    },
    [PREVIEWS_NAMESPACE]: {
        jobListings: JobListingPreview,
    },
};

export default components;
