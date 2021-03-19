import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router';

import useResourceUrlGenerator from '../../../hooks/useResourceUrlGenerator';
import { useResources } from '../../../contexts/PanneauContext';
import Menu from './Menu';

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
    const resources = useResources();
    const resourceRoute = useResourceUrlGenerator();
    const items = useMemo(
        () =>
            resources
                .filter(({ shows_in_navbar: showsInNavbar = false }) => showsInNavbar)
                .map((it) => {
                    const url = resourceRoute(it, 'index');
                    return {
                        id: it.id,
                        label: it.label,
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
