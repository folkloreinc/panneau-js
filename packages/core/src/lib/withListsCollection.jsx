import * as PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    listsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    listsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    listsCollection: PanneauPropTypes.componentsCollection,
};

export default function withListsCollection(opts) {
    const options = {
        withRef: false,
        listsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            listsCollection:
                props.listsCollection
                || context.listsCollection
                || (collection !== null ? collection.getCollection('lists') : null)
                || options.listsCollection,
        };
    };

    return (WrappedComponent) => {
        const WithCollectionComponent = withComponentsCollection(mapCollectionToProps, options)(
            WrappedComponent,
        );
        WithCollectionComponent.propTypes = propTypes;
        WithCollectionComponent.defaultProps = defaultProps;
        WithCollectionComponent.contextTypes = contextTypes;
        WithCollectionComponent.displayName = `withListsCollection(${getDisplayName(
            WrappedComponent,
        )})`;
        return WithCollectionComponent;
    };
}
