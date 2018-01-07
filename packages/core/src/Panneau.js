import React from 'react';
import {
    render as renderReact,
    hydrate as hydrateReact,
} from 'react-dom';

import PanneauComponent from './components/Panneau';

/**
 * Panneau Application
 */
class Panneau {
    static setDefaultFieldsCollection(fieldsCollection) {
        Panneau.defaultFieldsCollection = fieldsCollection;
    }

    static setDefaultLayoutsCollection(layoutsCollection) {
        Panneau.defaultLayoutsCollection = layoutsCollection;
    }

    /**
     * Create a new panneau environment
     * @param  {object} definition The definition of the Panneau instance
     * @param  {object} options Options for the new Panneau instance
     */
    constructor(definition, options) {
        this.options = {
            fieldsCollection: Panneau.defaultFieldsCollection,
            layoutsCollection: Panneau.defaultLayoutsCollection,
            ...options,
        };

        this.onRendered = this.onRendered.bind(this);

        const {
            fieldsCollection,
            layoutsCollection,
        } = this.options;

        this.element = null;
        this.definition = definition;
        this.fieldsCollection = fieldsCollection;
        this.layoutsCollection = layoutsCollection;
    }

    render(element) {
        this.element = element || this.element;
        const root = this.getRootElement();
        renderReact(element, root, this.onRendered);
    }

    hydrate(element) {
        this.element = element || this.element;
        const root = this.getRootElement();
        hydrateReact(element, root, this.onRendered);
    }

    onRendered() {

    }

    getRootProps() {
        const props = {
            fieldsCollection: this.fieldsCollection,
            layoutsCollection: this.layoutsCollection,
            definition: this.definition,
        };

        return props;
    }

    getRootElement() {
        const rootProps = this.getRootProps();
        const rootElement = React.createElement(PanneauComponent, rootProps);
        return rootElement;
    }

    /**
     * Set the Fields collection
     * @param {object} definition The new fields collection
     */
    setDefinition(definition) {
        this.definition = definition;
        return this;
    }

    /**
     * Get the fields collection
     * @return {object} The fields collection used by this instance
     */
    getDefinition() {
        return this.definition;
    }

    /**
     * Set the Fields collection
     * @param {FieldsCollection} fieldsCollection The new fields collection
     */
    setFieldsCollection(fieldsCollection) {
        this.fieldsCollection = fieldsCollection;
        return this;
    }

    /**
     * Get the fields collection
     * @return {FieldsCollection} The fields collection used by this instance
     */
    getFieldsCollection() {
        return this.fieldsCollection;
    }

    /**
     * Set the Layouts collection
     * @param {LayoutsCollection} layoutsCollection The new layouts collection
     */
    setLayoutsCollection(layoutsCollection) {
        this.layoutsCollection = layoutsCollection;
        return this;
    }

    /**
     * Get the layouts collection
     * @return {LayoutsCollection} The layouts collection used by this instance
     */
    getLayoutsCollection() {
        return this.layoutsCollection;
    }
}

Panneau.defaultFieldsCollection = null;
Panneau.defaultLayoutsCollection = null;

export default Panneau;
