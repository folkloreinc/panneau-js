import type { Definition } from '@panneau/protocol';

import { Link, usePathname } from './location';
import { type AppRoute, matchRoute, routePath } from './routes';

export interface ShellProps {
    definition: Definition;
    basePath: string;
}

function getTitle(route: AppRoute, definition: Definition): string {
    if (route.name === 'home') {
        return definition.name;
    }
    if (route.name === 'page') {
        const page = definition.pages?.[route.page];
        return page === undefined ? 'Page not found' : (page.label ?? route.page);
    }
    if (route.name === 'not-found') {
        return 'Page not found';
    }
    const resource = definition.resources.find(({ id }) => id === route.resource);
    if (resource === undefined) {
        return 'Page not found';
    }
    switch (route.name) {
        case 'resource.index':
            return resource.label.plural;
        case 'resource.create':
            return `New ${resource.label.singular}`;
        case 'resource.show':
            return `${resource.label.singular} ${route.id}`;
        case 'resource.edit':
            return `Edit ${resource.label.singular} ${route.id}`;
    }
}

/**
 * Placeholder of the app shell: the site name, the resources, and the title of the current route.
 * The real shell (layout, menus, pages) comes in Phase 2.
 */
export function Shell({ definition, basePath }: ShellProps) {
    const pathname = usePathname();
    const route = matchRoute(pathname, basePath) ?? { name: 'not-found' };
    return (
        <div data-panneau-shell="">
            <header>
                <Link href={routePath({ name: 'home' }, basePath)}>{definition.name}</Link>
                {definition.user !== undefined && definition.user !== null ? (
                    <span>{definition.user.name}</span>
                ) : null}
            </header>
            <nav aria-label="Resources">
                <ul>
                    {definition.resources.map((resource) => (
                        <li key={resource.id}>
                            <Link
                                href={routePath(
                                    { name: 'resource.index', resource: resource.id },
                                    basePath,
                                )}
                            >
                                {resource.label.plural}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <main>
                <h1>{getTitle(route, definition)}</h1>
                <p>The Panneau 5 app shell is not built yet.</p>
            </main>
        </div>
    );
}
