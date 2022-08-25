import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ResourceProvider } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceItem } from '@panneau/data';
import { useResourceValues } from '@panneau/intl';

import ResourceForm from '../forms/ResourceForm';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';

// import Button from '../buttons/Button';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    itemId: PropTypes.string.isRequired,
};

const defaultProps = {};

const ResourceDeletePage = ({ resource, itemId }) => {
    const history = useHistory();
    const resourceRoute = useResourceUrlGenerator(resource);
    const { item } = useResourceItem(resource, itemId);

    const onSuccess = useCallback(
        () => history.push(`${resourceRoute('index')}?deleted=true`),
        [history, resourceRoute],
    );

    // Navigate back
    const { entries = [] } = history || {};
    const previousEntry =
        entries !== null && entries.length > 1 ? entries[entries.length - 2] : null;
    const previous = previousEntry?.pathname || null;
    const resourceValues = useResourceValues(resource);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={
                        <FormattedMessage
                            values={resourceValues}
                            defaultMessage="Delete {a_singular}"
                            description="Page title"
                        />
                    }
                    small
                />
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">
                            {item !== null ? (
                                <ResourceForm
                                    component=""
                                    resource={resource}
                                    item={item}
                                    onSuccess={onSuccess}
                                    previous={previous}
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
