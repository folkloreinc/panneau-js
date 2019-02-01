import * as PanneauPropTypes from './PropTypes';
import withComponentsCollection from './withComponentsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const propTypes = {
    previewsCollection: PanneauPropTypes.componentsCollection,
};

const defaultProps = {
    previewsCollection: null,
};

const contextTypes = {
    componentsCollection: PanneauPropTypes.componentsCollection,
    previewsCollection: PanneauPropTypes.componentsCollection,
};

export default function withPreviewsCollection(opts) {
    const options = {
        withRef: false,
        previewsCollection: null,
        ...opts,
    };

    const mapCollectionToProps = (props, context) => {
        const collection = props.componentsCollection || context.componentsCollection || null;
        return {
            previewsCollection:
                props.previewsCollection
                || context.previewsCollection
                || (collection !== null ? collection.getCollection('previews') : null)
                || options.previewsCollection,
        };
    };

    return (WrappedComponent) => {
        const WithCollectionComponent = withComponentsCollection(mapCollectionToProps, options)(
            WrappedComponent,
        );
        WithCollectionComponent.propTypes = propTypes;
        WithCollectionComponent.defaultProps = defaultProps;
        WithCollectionComponent.contextTypes = contextTypes;
        WithCollectionComponent.displayName = `withPreviewsCollection(${getDisplayName(
            WrappedComponent,
        )})`;
        return WithCollectionComponent;
    };
}
