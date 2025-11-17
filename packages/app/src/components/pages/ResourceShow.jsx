import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceItem } from '@panneau/data';
import Loading from '@panneau/element-loading';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const ResourceShowPage = ({
    resource,
    itemId
}) => {
    const { name } = resource;
    const { item, loading, error } = useResourceItem(resource, itemId);
    const { type = null } = item || {};

    return (
        <ResourceProvider resource={resource}>
            <MainLayout loading={loading}>
                {item !== null ? (
                    <ResourceForm
                        resource={resource}
                        item={item}
                        type={type}
                        disabled
                        header={<PageHeader title={`${name} #${itemId}`} small />}
                        withContainer
                    />
                ) : null}
                {item === null && loading && !error ? (
                    <Loading withDelay>
                        <FormattedMessage defaultMessage="Loading" description="Loading label" />
                    </Loading>
                ) : null}
            </MainLayout>
        </ResourceProvider>
    );
};

ResourceShowPage.propTypes = propTypes;

export default ResourceShowPage;
