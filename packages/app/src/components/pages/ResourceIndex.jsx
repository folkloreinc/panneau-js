/* eslint-disable formatjs/no-camel-case */

/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useSearch } from 'wouter';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import {
    ResourceProvider,
    useComponentsManager,
    usePanneauColorScheme,
} from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Alert from '@panneau/element-alert';
import Button from '@panneau/element-button';
import { useResourceValues } from '@panneau/intl';

import ResourceCreateButton from '../buttons/ResourceCreate';
import MainLayout from '../layouts/Main';
import PageHeader from '../partials/PageHeader';
import ResourceItemsList from '../partials/ResourceItemsList';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    defaultActions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])), // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    defaultActions: ['create'],
};

const ResourceIndexPage = ({ resource, defaultActions }) => {
    const { theme = null } = usePanneauColorScheme();

    const { name, settings = {}, index = {} } = resource;
    const { canCreate = true, indexIsPaginated: paginated = false } = settings || {};
    const { actions: indexActions = null } = index || {};

    const finalActions = useMemo(
        () =>
            (indexActions || defaultActions.filter((it) => it !== 'create' || canCreate)).map(
                (it) =>
                    it === 'create'
                        ? {
                              id: 'create',
                              component: ResourceCreateButton,
                              size: 'lg',
                              theme: 'primary',
                          }
                        : it,
            ),
        [canCreate, indexActions],
    );

    const resourceValues = useResourceValues(resource);
    const componentsManager = useComponentsManager();
    const [, navigate] = useLocation();
    const search = useSearch();
    const query = useMemo(() => queryString.parse(search, { arrayFormat: 'bracket' }), [search]);
    const listQuery = useMemo(() => query, [query]); // TODO: omit routes
    const { created = false, deleted = false } = query || {};

    const resourceRoute = useResourceUrlGenerator(resource);
    const url = resourceRoute('index');

    const onQueryChange = useCallback(
        (submitQuery) => {
            const newQuery =
                submitQuery !== null
                    ? Object.keys(submitQuery).reduce((currentQuery, key) => {
                          const value = submitQuery[key];
                          return value !== null
                              ? {
                                    ...currentQuery,
                                    [key]: value,
                                }
                              : currentQuery;
                      }, null)
                    : null;
            navigate(
                `${url}${
                    newQuery !== null
                        ? `?${queryString.stringify(newQuery, {
                              arrayFormat: 'bracket',
                          })}`
                        : ''
                }`,
            );
        },
        [navigate, url, query, paginated],
    );

    const onQueryReset = useCallback(() => {
        const resetQuery = queryString.stringify(null, {
            arrayFormat: 'bracket',
        });
        navigate(`${url}?${resetQuery}`);
    }, [navigate, url, paginated]);

    const onClickCloseAlert = useCallback(() => {
        navigate(url, {
            replace: true,
        });
    }, [navigate, url]);

    return (
        <ResourceProvider resource={resource}>
            <MainLayout>
                <PageHeader
                    title={name}
                    actions={
                        finalActions.length > 0 ? (
                            <div className="d-flex align-items-center">
                                {finalActions.map(({ id, component = Button, ...actionsProps }) => {
                                    const ActionComponent = isString(component)
                                        ? componentsManager.getComponent(component)
                                        : component;
                                    return ActionComponent !== null ? (
                                        <ActionComponent
                                            key={`action-${id}`}
                                            {...actionsProps}
                                            {...(ActionComponent !== Button
                                                ? {
                                                      resource,
                                                      query,
                                                      onQueryChange,
                                                  }
                                                : {})}
                                        />
                                    ) : null;
                                })}
                            </div>
                        ) : null
                    }
                />
                <div className={classNames(['container-sm py-4'])}>
                    {created ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <FormattedMessage
                                values={resourceValues}
                                defaultMessage="{The_singular} has been created."
                                description="Alert message"
                            />
                        </Alert>
                    ) : null}
                    {deleted ? (
                        <Alert className="mb-4" onClose={onClickCloseAlert}>
                            <FormattedMessage
                                values={resourceValues}
                                defaultMessage="{The_singular} has been deleted."
                                description="Alert message"
                            />
                        </Alert>
                    ) : null}
                    <ResourceItemsList
                        resource={resource}
                        baseUrl={url}
                        query={listQuery}
                        paginated={paginated}
                        onQueryChange={onQueryChange}
                        onQueryReset={onQueryReset}
                        theme={theme}
                    />
                </div>
            </MainLayout>
        </ResourceProvider>
    );
};

ResourceIndexPage.propTypes = propTypes;
ResourceIndexPage.defaultProps = defaultProps;

export default ResourceIndexPage;
