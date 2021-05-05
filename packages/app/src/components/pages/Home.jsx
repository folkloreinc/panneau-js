import React from 'react';
import { Link } from 'react-router-dom';
import { usePanneauResources, useUrlGenerator } from '@panneau/core/contexts';

import ResourceLabel from '../partials/ResourceLabel';
import MainLayout from '../layouts/Main';

import messages from '../messages';

const propTypes = {};

const defaultProps = {};

const HomePage = () => {
    const route = useUrlGenerator();
    const resources = usePanneauResources();

    return (
        <MainLayout>
            <div className="container-sm py-4">
                {resources.map((resource) => {
                    const { id: resourceId, has_routes: hasRoutes } = resource || {};
                    const routeName = hasRoutes
                        ? `resources.${resourceId}.index`
                        : 'resources.index';
                    return (
                        <Link
                            className="d-block my-2"
                            key={`resource-link-${resourceId}`}
                            to={route(`${routeName}`, {
                                resource: resourceId,
                            })}
                        >
                            <ResourceLabel resource={resource}>{messages?.index}</ResourceLabel>
                        </Link>
                    );
                })}
            </div>
        </MainLayout>
    );
};
HomePage.propTypes = propTypes;
HomePage.defaultProps = defaultProps;

export default HomePage;
