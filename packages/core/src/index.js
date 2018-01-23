/** @module panneau/core */
import Panneau from './Panneau';
import ComponentsCollection from './lib/ComponentsCollection';
import createStore from './lib/createStore';
import { ResponseError, ValidationError } from './lib/requests';
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
};

/** The main Panneau application class */
export default Panneau;
