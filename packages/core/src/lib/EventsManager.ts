import EventEmitter from 'wolfy87-eventemitter';

type EventCallback = (...args: unknown[]) => void;

class EventsManager extends EventEmitter {
    element: EventTarget;
    events: Record<string, EventCallback[]>;
    listeners: Record<string, EventListener>;

    constructor(element: EventTarget) {
        super();

        this.element = element;
        this.events = {};
        this.listeners = {};
    }

    subscribe(event: string, callback: EventCallback): void {
        this.on(event, callback);

        this.events = {
            ...this.events,
            [event]: [...(this.events[event] || []), callback],
        };

        if (this.events[event].length === 1) {
            this.addEventListener(event);
        }
    }

    unsubscribe(event: string, callback: EventCallback): void {
        this.off(event, callback);

        this.events = Object.keys(this.events).reduce((newEvents, eventName) => {
            if (eventName !== event) {
                return {
                    ...newEvents,
                    [eventName]: this.events[eventName],
                };
            }
            const newListeners = this.events[eventName].filter((listener) => listener !== callback);
            return newListeners.length > 0
                ? {
                      ...newEvents,
                      [eventName]: newListeners,
                  }
                : newEvents;
        }, {});

        if (typeof this.events[event] === 'undefined') {
            this.removeEventListener(event);
        }
    }

    addEventListener(event: string): void {
        if (typeof this.listeners[event] === 'undefined') {
            this.listeners[event] = (...args: unknown[]) => this.emit(event, ...args);
        }
        this.element.addEventListener(event, this.listeners[event]);
    }

    removeEventListener(event: string): void {
        this.element.removeEventListener(event, this.listeners[event]);
    }
}

export default EventsManager;
