/* eslint-disable react/jsx-props-no-spreading */
import { usePanneauResources, useUrlGenerator } from '@panneau/core/contexts';
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/Main';
import messages from '../messages';
import ResourceLabel from '../partials/ResourceLabel';

const propTypes = {};

const defaultProps = {};

const HomePage = () => {
    const route = useUrlGenerator();
    const resources = usePanneauResources();
    const visibleResources = resources.filter(
        ({ settings: { hideInNavbar = false } = {} }) => !hideInNavbar,
    );

    return (
        <MainLayout>
            <div className="container-sm py-4">
                {visibleResources.map((resource) => {
                    const { id: resourceId } = resource || {};
                    return (
                        <Link
                            className="d-block my-2"
                            key={`resource-link-${resourceId}`}
                            to={route('resources.index', {
                                resource: resourceId,
                            })}
                        >
                            <ResourceLabel resource={resource} message={messages.index} />
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
