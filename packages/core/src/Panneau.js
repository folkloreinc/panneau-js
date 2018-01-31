import React from 'react';
import {
    render as renderReact,
    hydrate as hydrateReact,
} from 'react-dom';
import isObject from 'lodash/isObject';
import get from 'lodash/get';

import ComponentsCollection from './lib/ComponentsCollection';
import PanneauComponent from './components/Panneau';

/**
 * Panneau Application
 */
class Panneau {
    static setDefaultComponentsCollection(componentsCollection, namespace) {
        if (typeof namespace !== 'undefined') {
            Panneau.defaultComponentsCollection.setComponents(componentsCollection, namespace);
        } else {
            Panneau.defaultComponentsCollection = componentsCollection;
        }
    }

    static setDefaultLocaleMessages(locale, messages) {
        if (isObject(locale)) {
            Panneau.defaultLocaleMessages = {
                ...locale,
            };
        } else {
            Panneau.defaultLocaleMessages = {
                ...Panneau.defaultLocaleMessages,
                [locale]: {
                    ...messages,
                },
            };
        }
    }

    /**
     * Create a new panneau environment
     * @param  {object} definition The definition of the Panneau instance
     * @param  {object} options Options for the new Panneau instance
     */
    constructor(definition, options) {
        this.options = {
            componentsCollection: Panneau.defaultComponentsCollection,
            locale: 'en',
            messages: null,
            ...options,
        };

        this.onRendered = this.onRendered.bind(this);

        const {
            locale,
            messages,
            componentsCollection,
        } = this.options;

        this.locale = locale;

        const defaultMessages = get(Panneau.defaultLocaleMessages, this.locale, {});

        this.messages = get(messages, this.locale, defaultMessages);
        this.element = null;
        this.definition = definition;
        this.componentsCollection = componentsCollection;
    }

    render(element) {
        this.element = element || this.element;
        const root = this.getRootElement();
        renderReact(root, element, this.onRendered);
    }

    hydrate(element) {
        this.element = element || this.element;
        const root = this.getRootElement();
        hydrateReact(root, element, this.onRendered);
    }

    // eslint-disable-next-line
    onRendered() {}

    getRootProps() {
        return {
            componentsCollection: this.componentsCollection,
            definition: this.definition,
            locale: this.locale,
            messages: this.messages,
        };
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
     * Set the components collection
     * @param {ComponentsCollection} fieldsCollection The new fields collection
     */
    setComponentsCollection(componentsCollection, namespace) {
        if (typeof namespace !== 'undefined') {
            this.componentsCollection.setComponents(componentsCollection, namespace);
        } else {
            this.componentsCollection = componentsCollection;
        }
        return this;
    }

    /**
     * Get the components collection
     * @return {ComponentsCollection} The fields collection used by this instance
     */
    getComponentsCollection(namespace) {
        return typeof namespace !== 'undefined' ?
            this.componentsCollection.getCollection(namespace) : this.componentsCollection;
    }
}

Panneau.defaultComponentsCollection = new ComponentsCollection();
Panneau.defaultLocaleMessages = {};

export default Panneau;
