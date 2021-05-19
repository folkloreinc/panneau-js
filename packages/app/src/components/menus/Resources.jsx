import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router';

import { usePanneauResources } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';

import Menu from '@panneau/element-menu';

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    linkClassName: PropTypes.string,
};

const defaultProps = {
    className: null,
    itemClassName: null,
    linkClassName: null,
};

const ResourcesMenu = ({ className, itemClassName, linkClassName }) => {
    const { pathname } = useLocation();
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
};
ResourcesMenu.propTypes = propTypes;
ResourcesMenu.defaultProps = defaultProps;

export default ResourcesMenu;
