import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import routes from '../defaults/routes.json';
import parseDefinition from '../lib/parseDefinition';

import Container from './Container';

const propTypes = {
    locale: PropTypes.string,
    fieldsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    definition: PropTypes.shape({
        layout: PropTypes.object,
    }),
    routes: PropTypes.objectOf(PropTypes.string),
    texts: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
    locale: 'en',
    fieldsCollection: null,
    layoutsCollection: null,
    definition: null,
    routes,
    texts: {

    },
};

class Panneau extends Component {
    constructor(props) {
        super(props);

        this.getStoreInitialState = this.getStoreInitialState.bind(this);

        this.refContainer = null;
        this.store = null;
    }

    getStoreInitialState({ urlGenerator, ...props }) {
        console.log(props);
        const {
            fieldsCollection,
            layoutsCollection,
            definition,
        } = this.props;
        const cleanDefinition = parseDefinition(definition, {
            urlGenerator,
        });
        const layoutDefinition = get(cleanDefinition, 'layout', null);
        return {
            panneau: {
                definition: cleanDefinition,
                fieldsCollection,
                layoutsCollection,
            },
            layout: {
                definition: {
                    ...layoutDefinition,
                },
            },
        };
    }

    render() {
        const {
            fieldsCollection,
            layoutsCollection,
            definition,
            ...props
        } = this.props;

        return (
            <Container
                ref={(ref) => { this.refContainer = ref; }}
                getStoreInitialState={this.getStoreInitialState}
                {...props}
            />
        );
    }
}

Panneau.propTypes = propTypes;
Panneau.defaultProps = defaultProps;

export default Panneau;
