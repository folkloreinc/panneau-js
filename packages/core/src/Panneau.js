import React from 'react';
import {
    render as renderReact,
    hydrate as hydrateReact,
} from 'react-dom';
import EventEmitter from 'wolfy87-eventemitter';
import isObject from 'lodash/isObject';
import get from 'lodash/get';

import ComponentsCollection from './lib/ComponentsCollection';
import PanneauComponent from './components/Panneau';

/**
 * Panneau Application
 */
class Panneau extends EventEmitter {
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
        super();

        this.options = {
            componentsCollection: Panneau.defaultComponentsCollection,
            locale: 'en',
            messages: null,
        };

        this.onRendered = this.onRendered.bind(this);
        this.onHydrated = this.onHydrated.bind(this);

        this.element = null;
        this.rendered = false;
        this.definition = definition;
        this.locale = null;
        this.messages = {};
        this.componentsCollection = null;
        this.setOptions(options);
    }

    onRendered() {
        this.emit('rendered', this.element);
    }

    onHydrated() {
        this.emit('hydrated', this.element);
    }

    render(element) {
        this.rendered = true;
        this.element = element || this.element;
        const root = this.getRootElement();
        renderReact(root, this.element, this.onRendered);
        this.emit('render', this.element);
    }

    hydrate(element) {
        this.rendered = false;
        this.element = element || this.element;
        const root = this.getRootElement();
        hydrateReact(root, this.element, this.onHydrated);
        this.emit('hydrate', this.element);
    }

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
     * Set the options
     * @param {object} options The new options
     * @return {this}
     */
    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };

        const {
            locale,
            messages,
            componentsCollection,
        } = this.options;

        this.locale = locale;
        this.messages = {
            ...get(Panneau.defaultLocaleMessages, this.locale, {}),
            ...get(messages, this.locale, {}),
        };
        this.componentsCollection = componentsCollection;

        if (this.rendered) {
            this.render();
        }

        return this;
    }

    /**
     * Get the options
     * @return {object} The options
     */
    getOptions() {
        return this.options;
    }

    /**
     * Set the definition
     * @param {object} definition The new definition
     * @return {this}
     */
    setDefinition(definition) {
        this.definition = definition;
        return this;
    }

    /**
     * Get the definition
     * @return {object} The definition
     */
    getDefinition() {
        return this.definition;
    }

    /**
     * Alias to work with components collection
     * @return {ComponentsCollection} The components collection
     */
    components(key, value) {
        if (typeof value !== 'undefined') {
            this.componentsCollection.addComponent(key, value)
            return this;
        } else if (typeof key !== 'undefined') {
            return this.componentsCollection.getComponent(key);
        }
        return this.componentsCollection;
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
