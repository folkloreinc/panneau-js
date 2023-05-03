/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { usePanneauResources, useUrlGenerator } from '@panneau/core/contexts';
import { useResourceValues } from '@panneau/intl';

import MainLayout from '../layouts/Main';

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
                    const resourceValues = useResourceValues(resource);
                    return (
                        <Link
                            className="d-block my-2"
                            key={`resource-link-${resourceId}`}
                            to={route('resources.index', {
                                resource: resourceId,
                            })}
                        >
                            <FormattedMessage
                                values={resourceValues}
                                defaultMessage="View {the_plural}"
                                description="Button label"
                            />
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
