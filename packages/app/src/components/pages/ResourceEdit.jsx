// import PropTypes from 'prop-types';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceTypeName } from '@panneau/core/hooks';
import { useResourceItem } from '@panneau/data';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
import Loading from '@panneau/element-loading';

const propTypes = {
    itemId: PropTypes.string.isRequired,
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceEditPage = ({ itemId, resource }) => {
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};
    const [editItem, setEditItem] = useState(item);
    const typeName = useResourceTypeName(resource, type);
    const onSuccess = useCallback((newItem) => setEditItem(newItem), []);

    useEffect(() => {
        setEditItem(item);
    }, [item, setEditItem]);

    const resourceValues = useResourceValues(resource);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <>
                            <FormattedMessage
                                values={resourceValues}
                                defaultMessage="Edit {a_singular}"
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
                            {editItem !== null ? (
                                <ResourceForm
                                    resource={resource}
                                    item={editItem}
                                    type={type}
                                    onSuccess={onSuccess}
                                />
                            ) : null}
                            {editItem === null && loading && !error ? (
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
ResourceEditPage.propTypes = propTypes;
ResourceEditPage.defaultProps = defaultProps;

export default ResourceEditPage;
