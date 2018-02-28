/** @module panneau/core */
import Panneau from './Panneau';
import ComponentsCollection from './lib/ComponentsCollection';
import {
    ResponseError,
    ValidationError,
    throwResponseError,
    throwValidationError,
} from './lib/requests';
import {
    Panneau as PanneauComponent,
} from './components/index';

export {
    ComponentsCollection,
    PanneauComponent,
    ResponseError,
    ValidationError,
    throwResponseError,
    throwValidationError,
};

/** The main Panneau application class */
export default Panneau;
