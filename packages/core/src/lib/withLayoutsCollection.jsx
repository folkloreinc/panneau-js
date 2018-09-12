import * as PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    layoutsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    layoutsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    layoutsCollection: PanneauPropTypes.componentsCollection,
};

export default function withLayoutsCollection(opts) {
    const options = {
        withRef: false,
        layoutsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            layoutsCollection:
                props.layoutsCollection
                || context.layoutsCollection
                || (collection !== null ? collection.getCollection('layouts') : null)
                || options.layoutsCollection,
        };
    };

    return (WrappedComponent) => {
        const WithCollectionComponent = withComponentsCollection(mapCollectionToProps, options)(
            WrappedComponent,
        );
        WithCollectionComponent.propTypes = propTypes;
        WithCollectionComponent.defaultProps = defaultProps;
        WithCollectionComponent.contextTypes = contextTypes;
        WithCollectionComponent.displayName = `withLayoutsCollection(${getDisplayName(
            WrappedComponent,
        )})`;
        return WithCollectionComponent;
    };
}
