import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';

import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceShowPage = ({ resource }) => (
    <ResourceProvider resource={resource}>
        <MainLayout>
            <PageHeader title={resource?.name} />
            <div className="container-sm">Show page</div>
        </MainLayout>
    </ResourceProvider>
);
ResourceShowPage.propTypes = propTypes;
ResourceShowPage.defaultProps = defaultProps;

export default ResourceShowPage;
