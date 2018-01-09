import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

const propTypes = {
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }).isRequired,
    definition: PropTypes.shape({
        header: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.object,
        ]),
    }),
};

const defaultProps = {
    definition: null,
};

const Layout = ({ definition, layoutsCollection, ...props }) => {
    const componentName = get(definition, 'type', 'normal');
    const LayoutComponent = layoutsCollection.getComponent(componentName);
    return (
        <LayoutComponent
            definition={definition}
            {...props}
        />
    );
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

const mapStateToProps = ({ layout, panneau }) => ({
    applicationDefinition: panneau.definition,
    layoutsCollection: panneau.componentsCollection.getCollection('layouts'),
    ...layout,
});

const mapDispatchToProps = dispatch => ({
    gotoHome: () => dispatch(push('/')),
    goto: path => dispatch(push(path)),
});

const WithStoreContainer = connect(mapStateToProps, mapDispatchToProps)(Layout);
export default WithStoreContainer;
