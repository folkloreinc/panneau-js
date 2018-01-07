import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';

import createStoreBase from '../lib/createStore';
import createStoreContainer from '../lib/createStoreContainer';
import createRouterContainer from '../lib/createRouterContainer';
import createIntlContainer from '../lib/createIntlContainer';
import createUrlGeneratorContainer from '../lib/createUrlGeneratorContainer';
import createRoutes from '../lib/createRoutes';

const DevTools = __DEV__ ? require('./DevTools').default : null;

const propTypes = {
    store: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    router: PropTypes.node.isRequired,
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    /* eslint-disable react/no-unused-prop-types */
    getStoreInitialState: PropTypes.func,
    /* eslint-enable react/no-unused-prop-types */
};

const defaultProps = {
    getStoreInitialState: () => {},
};

class Container extends Component {
    constructor(props) {
        super(props);

        this.state = {
            history: props.history && props.store ? syncHistoryWithStore(
                props.history,
                props.store,
            ) : null,
        };
    }

    componentWillReceiveProps(nextProps) {
        const historyChanged = nextProps.history !== this.props.history;
        const storeChanged = nextProps.store !== this.props.store;
        if (historyChanged || storeChanged) {
            this.setState({
                history: nextProps.history && nextProps.store ? syncHistoryWithStore(
                    nextProps.history,
                    nextProps.store,
                ) : null,
            });
        }
    }

    render() {
        const { router } = this.props;
        const { history } = this.state;

        const routerWithHistory = history !== null ? React.cloneElement(router, {
            history,
        }) : router;

        const content = routerWithHistory;

        const root = __DEV__ ? (
            <div>
                { content }
                <DevTools />
            </div>
        ) : content;

        return root;
    }
}

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

// Select intl locale
const selectLocale = props => props.selectLocale || (
    props.locale ? props.locale : null
);

// Select intl messages
const selectMessages = props => props.selectTexts || (
    props.texts ? props.texts : null
);

// Select routes for the url generator
const selectRoutes = props => props.selectRoutes || (
    props.routes ? props.routes : null
);

// Creating routes
const selectRouterRoutes = props => (
    props.routerRoutes ?
        props.routerRoutes : createRoutes(props.urlGenerator)
);

// Creating store from props
const createStore = ({ getStoreInitialState, ...props }) => createStoreBase(
    getStoreInitialState(props),
    [
        routerMiddleware(props.history),
    ],
);

const WithStoreContainer = createStoreContainer(createStore)(Container);
const WithRouterContainer = createRouterContainer(selectRouterRoutes)(WithStoreContainer);
const WithUrlGeneratorContainer = createUrlGeneratorContainer(selectRoutes)(WithRouterContainer);
const WithIntlContainer = createIntlContainer(
    selectLocale,
    selectMessages,
)(WithUrlGeneratorContainer);
export default WithIntlContainer;
