import React from 'react';
import { useParams } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceShowPage = ({ resource }) => {
    const { name } = resource;
    const { id: itemId } = useParams();
    const { item } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader title={`${name} #${itemId}`} small />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            <ResourceForm resource={resource} item={item} type={type} disabled />
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};

ResourceShowPage.propTypes = propTypes;
ResourceShowPage.defaultProps = defaultProps;

export default ResourceShowPage;
