import PropTypes from 'prop-types';
import get from 'lodash/get';
import { createAppContainer } from '@folklore/react-app';
import createBrowserHistory from 'history/createBrowserHistory';
import createMemoryHistory from 'history/createMemoryHistory';

import defaultRoutes from '../defaults/routes.json';
import reducers from '../reducers/index';
import parseDefinition from './parseDefinition';

const containerPropTypes = {
    locale: PropTypes.string,
    memoryRouter: PropTypes.bool,
    routes: PropTypes.objectOf(PropTypes.string),
};

const containerDefaultProps = {
    locale: 'en',
    memoryRouter: false,
    routes: defaultRoutes,
};

const createContainer = (Component) => {
    const createHistory = ({ memoryRouter }) => (
        memoryRouter ? createMemoryHistory() : createBrowserHistory()
    );

    const getStoreReducers = () => reducers;

    const getStoreInitialState = ({ urlGenerator, componentsCollection, definition }) => {
        const cleanDefinition = parseDefinition(definition, {
            urlGenerator,
        });
        const layoutDefinition = get(cleanDefinition, 'layout', null);
        return {
            panneau: {
                definition: cleanDefinition,
                componentsCollection,
            },
            layout: {
                definition: {
                    ...layoutDefinition,
                },
            },
        };
    };

    const getUrlGeneratorRoutes = ({ routes, definition }) => {
        const definitionRoutes = get(definition, 'routes', {});
        const resources = get(definition, 'resources', []).filter((
            it => typeof it.routes !== 'undefined'
        ));
        const resourcesRoutes = resources.reduce(
            (totalRoutes, resource) => ({
                ...totalRoutes,
                ...Object.keys(resource.routes).reduce(
                    (mapRoutes, name) => ({
                        ...mapRoutes,
                        [`resource.${resource.id}.${name}`]: resource.routes[name],
                    }),
                    {},
                ),
            }),
            {},
        );
        return {
            ...routes,
            ...definitionRoutes,
            ...resourcesRoutes,
        };
    };

    return createAppContainer({
        propTypes: containerPropTypes,
        defaultProps: containerDefaultProps,
        createHistory,
        getUrlGeneratorRoutes,
        getStoreReducers,
        getStoreInitialState,
    })(Component);
};

export default createContainer;
