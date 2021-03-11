import EventEmitter from 'wolfy87-eventemitter';

class EventsManager extends EventEmitter {
    constructor(element) {
        super();

        this.element = element;
        this.events = {};
        this.listeners = {};
    }

    subscribe(event, callback) {
        this.on(event, callback);

        this.events = {
            ...this.events,
            [event]: [...(this.events[event] || []), callback],
        };

        if (this.events[event].length === 1) {
            this.addEventListener(event);
        }
    }

    unsubscribe(event, callback) {
        this.off(event, callback);

        this.events = Object.keys(this.events).reduce((newEvents, eventName) => {
            if (eventName !== event) {
                return {
                    ...newEvents,
                    [eventName]: this.events[eventName],
                };
            }
            const newListeners = this.events[eventName].filter(listener => listener !== callback);
            return newListeners.length > 0 ? {
                ...newEvents,
                [eventName]: newListeners,
            } : newEvents;
        }, {});

        if (typeof this.events[event] === 'undefined') {
            this.removeEventListener(event);
        }
    }

    addEventListener(event) {
        if (typeof this.listeners[event] === 'undefined') {
            this.listeners[event] = (...args) => this.emit(event, ...args);
        }
        this.element.addEventListener(event, this.listeners[event]);
    }

    removeEventListener(event) {
        this.element.removeEventListener(event, this.listeners[event]);
    }
}

export default EventsManager;
