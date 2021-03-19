import React, { useCallback, useMemo } from 'react';
import { parse as parseQuery, stringify as stringifyQuery } from 'query-string';
import { useLocation, useHistory } from 'react-router';
import classNames from 'classnames';
import omit from 'lodash/omit';
// import { defineMessages } from 'react-intl';

import * as PanneauPropTypes from '../../../lib/panneau/PropTypes';
import { ResourceProvider } from '../../../contexts/ResourceContext';
import useResourceUrlGenerator from '../../../hooks/useResourceUrlGenerator';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
import Button from '../buttons/Button';
import ResourceLabel from '../partials/ResourceLabel';
import Alert from '../partials/Alert';
import ResourceItemsList from '../lists/ResourceItems';

import resourcesMessages from '../resourcesMessages';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
};

const defaultProps = {};

const ResourceIndexPage = ({ resource }) => {
    const {
        label,
        can_create: canCreate = false,
        index_is_paginated: paginated = false,
        components: { index: indexComponent = null } = {},
    } = resource;
    const { search } = useLocation();
    const history = useHistory();
    const query = useMemo(() => parseQuery(search), [search]);
    const listQuery = useMemo(() => omit(query, ['created', 'deleted']), [query]);
    const { created = false, deleted = false } = query;
    const resourceRoute = useResourceUrlGenerator(resource);
    const url = resourceRoute('index');
    const onQueryChange = useCallback(
        (submitQuery) => {
            history.push(`${url}?${stringifyQuery(submitQuery, {
                arrayFormat: 'bracket'
            })}`);
        },
        [history, url],
    );
    const onClickCloseAlert = useCallback(() => {
        history.replace(url);
    }, [history, url]);
    const fullscreen = indexComponent === 'chat' || indexComponent === 'schedule';
    return (
        <ResourceProvider resource={resource}>
            <MainLayout fullscreen={fullscreen}>
                <PageHeader
                    title={label}
                    actions={
                        canCreate ? (
                            <Button href={resourceRoute('create')} size="lg" theme="primary">
                                <ResourceLabel resource={resource}>
                                    {resourcesMessages.create}
                                </ResourceLabel>
                            </Button>
                        ) : null
                    }
                />
                <div
                    className={classNames({
                        'container-sm py-4': !fullscreen,
                        'd-flex flex-grow-1 flex-column': fullscreen,
                    })}
                >
                    {created ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceLabel resource={resource}>
                                {resourcesMessages.created}
                            </ResourceLabel>
                        </Alert>
                    ) : null}
                    {deleted ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <ResourceLabel resource={resource}>
                                {resourcesMessages.deleted}
                            </ResourceLabel>
                        </Alert>
                    ) : null}
                    <ResourceItemsList
                        resource={resource}
                        baseUrl={url}
                        query={listQuery}
                        paginated={paginated}
                        component={indexComponent}
                        onQueryChange={onQueryChange}
                        className={classNames({
                            'flex-grow-1': fullscreen,
                        })}
                    />
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};
ResourceIndexPage.propTypes = propTypes;
ResourceIndexPage.defaultProps = defaultProps;

export default ResourceIndexPage;
