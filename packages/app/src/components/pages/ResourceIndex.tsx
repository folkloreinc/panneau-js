import classNames from 'classnames';
import isString from 'lodash/isString';
import queryString from 'query-string';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation, useSearch } from 'wouter';

import type { Resource } from '@panneau/core';
import {
    ResourceProvider,
    useActionsComponentsManager,
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

interface ResourceIndexPageProps {
    resource: Resource;
    defaultActions?: Array<string | Record<string, unknown>>;
}

const DEFAULT_ACTIONS = ['create'];

function ResourceIndexPage({ resource, defaultActions = DEFAULT_ACTIONS }: ResourceIndexPageProps) {
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
                              size: 'md',
                              theme: 'primary',
                          }
                        : it,
            ),
        [canCreate, indexActions, defaultActions],
    );

    const resourceValues = useResourceValues(resource);
    const actionsComponentsManager = useActionsComponentsManager();
    const [, navigate] = useLocation();
    const search = useSearch();
    const query = useMemo(() => queryString.parse(search, { arrayFormat: 'bracket' }), [search]);
    const listQuery = useMemo(() => query, [query]); // TODO: omit routes
    const { created = false, deleted = false } = query || {};

    const resourceRoute = useResourceUrlGenerator(resource);
    const url = resourceRoute('index');

    const onQueryChange = useCallback(
        (submitQuery: Record<string, unknown> | null) => {
            const newQuery =
                submitQuery !== null
                    ? Object.keys(submitQuery).reduce(
                          (currentQuery, key) => {
                              const value = submitQuery[key];
                              return value !== null
                                  ? {
                                        ...currentQuery,
                                        [key]: value,
                                    }
                                  : currentQuery;
                          },
                          {} as Record<string, unknown>,
                      )
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
        [navigate, url],
    );

    const onQueryReset = useCallback(() => {
        const resetQuery = queryString.stringify(null, {
            arrayFormat: 'bracket',
        });
        navigate(`${url}?${resetQuery}`);
    }, [navigate, url]);

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
                                {finalActions.map(
                                    ({
                                        id,
                                        component = Button,
                                        withQuery = false,
                                        href = null,
                                        ...otherProps
                                    }: any) => {
                                        const ActionComponent = isString(component)
                                            ? actionsComponentsManager.getComponent(component)
                                            : component;
                                        const isButton = ActionComponent === Button;
                                        let finalHref = href;
                                        if (isButton && withQuery && href !== null) {
                                            finalHref = `${finalHref}${finalHref.indexOf('?') !== -1 ? '&' : '?'}${queryString.stringify(
                                                query,
                                                {
                                                    arrayFormat: 'bracket',
                                                },
                                            )}`;
                                        }
                                        return ActionComponent !== null ? (
                                            <ActionComponent
                                                key={`action-${id}`}
                                                href={finalHref}
                                                {...otherProps}
                                                {...(!isButton
                                                    ? {
                                                          resource,
                                                          query,
                                                          onQueryChange,
                                                      }
                                                    : {})}
                                            />
                                        ) : null;
                                    },
                                )}
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
                        // actionsProps={{ size: 'sm' }}
                    />
                </div>
            </MainLayout>
        </ResourceProvider>
    );
}

export default ResourceIndexPage;
