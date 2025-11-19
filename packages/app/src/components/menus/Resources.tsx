import { useLocation } from 'wouter';
import React, { useMemo } from 'react';

import { usePanneauResources } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Menu from '@panneau/element-menu';

interface ResourcesMenuProps {
    className?: string | null;
    itemClassName?: string | null;
    linkClassName?: string | null;
}

function ResourcesMenu({
    className = null,
    itemClassName = null,
    linkClassName = null,
}: ResourcesMenuProps) {
    const [pathname] = useLocation();
    const resources = usePanneauResources();
    const resourceRoute = useResourceUrlGenerator();

    const items = useMemo(
        () =>
            resources
                .filter(({ settings: { hideInNavbar = false } = {} }) => !hideInNavbar)
                .map((it) => {
                    const url = resourceRoute(it, 'index');
                    return {
                        id: it.id,
                        label: it.name,
                        href: url,
                        active: pathname.substr(0, url.length) === url,
                    };
                }),
        [resources, pathname, resourceRoute],
    );

    return (
        <Menu
            items={items}
            className={className}
            itemClassName={itemClassName}
            linkClassName={linkClassName}
        />
    );
}

export default ResourcesMenu;
