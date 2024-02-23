// import PropTypes from 'prop-types';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'wouter';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName, useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceItem } from '@panneau/data';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    itemId: PropTypes.string.isRequired,
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceDeletePage = ({ itemId, resource }) => {
    const [, navigate] = useLocation();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    const resourceValues = useResourceValues(resource);
    const typeName = useResourceTypeName(resource, type);

    const onSuccess = useCallback(
        () => navigate(`${resourceRoute('index')}?deleted=true`),
        [navigate, resourceRoute],
    );

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <>
                            <FormattedMessage
                                values={resourceValues}
                                defaultMessage="Delete {a_singular}"
                                description="Page title"
                            />
                            {typeName !== null ? (
                                <span className="text-body-secondary"> ({typeName})</span>
                            ) : null}
                        </>
                    }
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {item !== null ? (
                                <ResourceForm
                                    resource={resource}
                                    item={item}
                                    onSuccess={onSuccess}
                                    isDelete
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceDeletePage.propTypes = propTypes;
ResourceDeletePage.defaultProps = defaultProps;

export default ResourceDeletePage;
