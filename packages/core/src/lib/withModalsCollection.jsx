import PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    modalsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    modalsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    modalsCollection: PanneauPropTypes.componentsCollection,
};

export default function withModalsCollection(opts) {
    const options = {
        withRef: false,
        modalsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            modalsCollection:
                props.modalsCollection ||
                context.modalsCollection ||
                (collection !== null ? collection.getCollection('modals') : null) ||
                options.modalsCollection,
        };
    };

    return (WrappedComponent) => {
        const WithCollectionComponent = withComponentsCollection(
            mapCollectionToProps,
            options,
        )(WrappedComponent);
        WithCollectionComponent.propTypes = propTypes;
        WithCollectionComponent.defaultProps = defaultProps;
        WithCollectionComponent.contextTypes = contextTypes;
        WithCollectionComponent.displayName = `withModalsCollection(${getDisplayName(WrappedComponent)})`;
        return WithCollectionComponent;
    };
}
