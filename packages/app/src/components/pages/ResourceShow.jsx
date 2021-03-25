import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { ResourceProvider } from '@panneau/core/contexts';
import MainLayout from '../layouts/Main';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceShowPage = ({ resource }) => (
    <ResourceProvider resource={resource}>
        <MainLayout>
            <div className="container-sm">Panneau</div>
        </MainLayout>
    </ResourceProvider>
);
ResourceShowPage.propTypes = propTypes;
ResourceShowPage.defaultProps = defaultProps;

export default ResourceShowPage;
