import PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    formsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    formsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    formsCollection: PanneauPropTypes.componentsCollection,
};

export default function withFormsCollection(opts) {
    const options = {
        withRef: false,
        formsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            formsCollection:
                props.formsCollection ||
                context.formsCollection ||
                (collection !== null ? collection.getCollection('forms') : null) ||
                options.formsCollection,
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
        WithCollectionComponent.displayName = `withFormsCollection(${getDisplayName(WrappedComponent)})`;
        return WithCollectionComponent;
    };
}
