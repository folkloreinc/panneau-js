import type { DefinitionInput, Widget } from './schemas';

/** The page whose dashboard is the home page, and the `page` of a widget request without one. */
export const HOME_PAGE = 'home';

/** The component of the built-in dashboard page. */
export const DASHBOARD_COMPONENT = 'dashboard';

/** The parts of a definition that declare dashboards: its pages, and `dashboard`. */
type DashboardsOf = Pick<DefinitionInput, 'pages' | 'dashboard'>;

/**
 * The widgets of the dashboard of a page, in order (decisions 0064 and 0084): the `widgets` of a
 * page whose component is the built-in `dashboard`. The home page is the dashboard of `pages.home`,
 * and `definition.dashboard` is its shorthand: its widgets are `pages.home.widgets` when set, else
 * those of `definition.dashboard`. Empty for any other page.
 */
export function getDashboardWidgets(definition: DashboardsOf, page: string = HOME_PAGE): Widget[] {
    const own = definition.pages?.[page];
    if (own?.component === DASHBOARD_COMPONENT && own.widgets !== undefined) {
        return own.widgets;
    }
    return page === HOME_PAGE ? (definition.dashboard?.widgets ?? []) : [];
}

/**
 * The pages that have a dashboard of widgets, home first: `home` when its widgets are declared
 * (`pages.home.widgets` or `definition.dashboard`), then each other page whose component is the
 * built-in `dashboard`, in the order of `pages`.
 */
export function getDashboardPages(definition: DashboardsOf): string[] {
    const home = definition.pages?.[HOME_PAGE];
    const hasHome =
        definition.dashboard !== undefined ||
        (home?.component === DASHBOARD_COMPONENT && home.widgets !== undefined);
    return [
        ...(hasHome ? [HOME_PAGE] : []),
        ...Object.entries(definition.pages ?? {})
            .filter(([id, page]) => id !== HOME_PAGE && page.component === DASHBOARD_COMPONENT)
            .map(([id]) => id),
    ];
}
