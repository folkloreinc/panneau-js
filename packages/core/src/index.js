/** @module panneau/core */
import Panneau from './Panneau';
import { Panneau as PanneauComponent, Loading as LoadingComponent } from './components/index';

import PropTypes from './lib/PropTypes';
import ComponentsCollection from './lib/ComponentsCollection';
import withUrlGenerator from './lib/withUrlGenerator';
import withDefinition from './lib/withDefinition';
import withResourceApi from './lib/withResourceApi';
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
    postJSON,
    getJSON,
} from './lib/requests';

import { isMessage } from './utils';

export {
    PropTypes,
    ComponentsCollection,
    PanneauComponent,
    LoadingComponent,
    ResponseError,
    ValidationError,
    getResponseAndDataObject,
    throwResponseError,
    throwValidationError,
    postJSON,
    getJSON,
    withUrlGenerator,
    withDefinition,
    withResourceApi,
    withComponentsCollection,
    withFormsCollection,
    withFieldsCollection,
    withListsCollection,
    withLayoutsCollection,
    withModalsCollection,
    isMessage,
};

/** The main Panneau application class */
export default Panneau;
