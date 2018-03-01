import PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    fieldsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    fieldsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    fieldsCollection: PanneauPropTypes.componentsCollection,
};

export default function withFieldsCollection(opts) {
    const options = {
        withRef: false,
        fieldsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            fieldsCollection:
                props.fieldsCollection ||
                context.fieldsCollection ||
                (collection !== null ? collection.getCollection('fields') : null) ||
                options.fieldsCollection,
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
        WithCollectionComponent.displayName = `withFieldsCollection(${getDisplayName(WrappedComponent)})`;
        return WithCollectionComponent;
    };
}
