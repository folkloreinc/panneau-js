/** @module panneau/core */
import Panneau from './Panneau';
import ComponentsCollection from './lib/ComponentsCollection';
import createStore from './lib/createStore';
import withUrlGenerator from './lib/withUrlGenerator';
import {
    ResponseError,
    ValidationError,
    throwResponseError,
    throwValidationError,
} from './lib/requests';
import {
    Panneau as PanneauComponent,
    Container as ContainerComponent,
} from './components/index';

export {
    ComponentsCollection,
    PanneauComponent,
    ContainerComponent,
    createStore,
    ResponseError,
    ValidationError,
    throwResponseError,
    throwValidationError,
    withUrlGenerator,
};

/** The main Panneau application class */
export default Panneau;
