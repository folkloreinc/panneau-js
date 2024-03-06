import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import Loading from '@panneau/element-loading';
import { FormattedMessage } from 'react-intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';


const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceShowPage = ({ resource, itemId }) => {
    const { name } = resource;
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader title={`${name} #${itemId}`} small />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {item !== null ? (
                                <ResourceForm resource={resource} item={item} type={type} disabled />
                            ) : null}
                            {item === null && loading && !error ? (
                                <Loading>
                                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                                </Loading>
                            ) : null}
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
