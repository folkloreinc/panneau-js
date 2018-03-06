/** @module panneau/core */
import Panneau from './Panneau';
import { Panneau as PanneauComponent } from './components/index';

import PropTypes from './lib/PropTypes';
import ComponentsCollection from './lib/ComponentsCollection';
import withComponentsCollection from './lib/withComponentsCollection';
import withFormsCollection from './lib/withFormsCollection';
import withFieldsCollection from './lib/withFieldsCollection';
import withListsCollection from './lib/withListsCollection';
import withLayoutsCollection from './lib/withLayoutsCollection';
import withModalsCollection from './lib/withModalsCollection';

import {
    ResponseError,
    ValidationError,
    getResponseAndDataObject,
    throwResponseError,
    throwValidationError,
} from './lib/requests';

export {
    PropTypes,
    ComponentsCollection,
    PanneauComponent,
    ResponseError,
    ValidationError,
    getResponseAndDataObject,
    throwResponseError,
    throwValidationError,
    withComponentsCollection,
    withFormsCollection,
    withFieldsCollection,
    withListsCollection,
    withLayoutsCollection,
    withModalsCollection,
};

/** The main Panneau application class */
export default Panneau;
