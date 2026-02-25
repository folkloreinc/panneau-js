import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

const buildThresholdArray = (): number[] => [0, 1.0];

type ObserverConstructor<T> =
    | (new (
          callback: (entries: T[]) => void,
          options?: Record<string, unknown>,
      ) => {
          observe: (element: Element) => void;
          unobserve?: (element: Element) => void;
          disconnect: () => void;
      })
    | null;

interface Subscriber<T> {
    element: Element;
    callbacks: Array<(entry: T) => void>;
}

interface ObserverWrapper<T> {
    subscribe: (element: Element, callback: (entry: T) => void) => void;
    unsubscribe: (element: Element, callback?: ((entry: T) => void) | null) => void;
    observer: ReturnType<NonNullable<ObserverConstructor<T>>>;
}

interface ObserverOptions {
    root?: Element | null;
    rootMargin?: string | null;
    threshold?: number | number[] | null;
    disabled?: boolean;
}

const observersCache = new Map<ObserverConstructor<any>, Record<string, ObserverWrapper<any>>>();

const getOptionsKey = ({ root = null, rootMargin, threshold = null }: ObserverOptions): string =>
    `root_${root}_rootMargin_${rootMargin || null}_threshold_${threshold}`;

const createObserver = <T>(
    Observer: NonNullable<ObserverConstructor<T>>,
    options: Record<string, unknown> = {},
): ObserverWrapper<T> => {
    let subscribers: Subscriber<T>[] = [];

    const addSubscriber = (element: Element, callback: (entry: T) => void): Subscriber<T>[] => {
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        if (currentSubscriber !== null) {
            return subscribers
                .map((it) =>
                    it.element === element && it.callbacks.indexOf(callback) === -1
                        ? {
                              ...it,
                              callbacks: [...it.callbacks, callback],
                          }
                        : it,
                )
                .filter((it) => it.callbacks.length > 0);
        }
        return [
            ...subscribers,
            {
                element,
                callbacks: [callback],
            },
        ];
    };

    const removeSubscriber = (element: Element, callback: (entry: T) => void): Subscriber<T>[] =>
        subscribers
            .map((it) =>
                it.element === element
                    ? {
                          ...it,
                          callbacks: it.callbacks.filter((subCallback) => subCallback !== callback),
                      }
                    : it,
            )
            .filter((it) => it.callbacks.length > 0);

    const onUpdate = (entries: T[]): void => {
        entries.forEach((entry: any) => {
            subscribers.forEach(({ element, callbacks }) => {
                if (element === entry.target) {
                    callbacks.forEach((callback) => {
                        callback(entry);
                    });
                }
            });
        });
    };

    const observer = new Observer(onUpdate, options);

    const unsubscribe = (element: Element, callback: ((entry: T) => void) | null = null): void => {
        subscribers = removeSubscriber(element, callback as (entry: T) => void);
        if (typeof observer.unobserve === 'undefined') {
            observer.disconnect();
            subscribers.forEach((subscriber) => {
                observer.observe(subscriber.element);
            });
            return;
        }
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        if (currentSubscriber === null) {
            observer.unobserve(element);
        }
    };

    const subscribe = (element: Element, callback: (entry: T) => void): void => {
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        subscribers = addSubscriber(element, callback);
        if (currentSubscriber === null) {
            observer.observe(element);
        }
    };

    return {
        subscribe,
        unsubscribe,
        observer,
    };
};

export const getObserver = <T>(
    Observer: ObserverConstructor<T>,
    options: ObserverOptions = {},
): ObserverWrapper<T> => {
    if (Observer === null) {
        throw new Error('Observer constructor is null');
    }
    const observerKey = getOptionsKey(options);
    if (!observersCache.has(Observer)) {
        observersCache.set(Observer, {});
    }
    const observers = observersCache.get(Observer)!;
    if (typeof observers[observerKey] === 'undefined') {
        observers[observerKey] = createObserver(Observer, options as Record<string, unknown>);
        observersCache.set(Observer, observers);
    }
    return observers[observerKey];
};

interface UseObserverReturn<T> {
    ref: RefObject<Element>;
    entry: T;
}

export const useObserver = <T>(
    Observer: ObserverConstructor<T>,
    opts: ObserverOptions = {},
    initialEntry: T = {} as T,
): UseObserverReturn<T> => {
    const { root = null, rootMargin = null, threshold = null, disabled = false } = opts;
    const [entry, setEntry] = useState<T>(initialEntry);
    const nodeRef = useRef<Element>(null);
    const currentElement = useRef<Element | null>(null);
    const elementChanged = nodeRef.current !== currentElement.current;
    useEffect(() => {
        const { current: nodeElement } = nodeRef;
        const callback = (newEntry: T) => setEntry(newEntry);
        let unsubscribe: ((element: Element, callback: (entry: T) => void) => void) | null = null;
        if (nodeElement !== null && Observer !== null) {
            const newOpts: ObserverOptions = {};
            if (root !== null) {
                newOpts.root = root;
            }
            if (rootMargin !== null) {
                newOpts.rootMargin = rootMargin;
            }
            if (threshold !== null) {
                newOpts.threshold = threshold;
            }
            const { subscribe, unsubscribe: localUnsubscribe } = getObserver(Observer, newOpts);
            unsubscribe = localUnsubscribe;
            subscribe(nodeElement, callback);
        }
        currentElement.current = nodeElement;
        return () => {
            if (unsubscribe !== null && nodeElement !== null) {
                unsubscribe(nodeElement, callback);
            }
        };
    }, [Observer, elementChanged, disabled, root, rootMargin, threshold]);

    return {
        ref: nodeRef,
        entry,
    };
};

/**
 * Intersection Observer
 */
const thresholdArray = buildThresholdArray();

interface IntersectionObserverEntry {
    target: Element | null;
    time: number | null;
    isVisible: boolean;
    isIntersecting: boolean;
    intersectionRatio: number;
    intersectionRect: DOMRectReadOnly | null;
    boundingClientRect: DOMRectReadOnly | null;
    rootBounds: DOMRectReadOnly | null;
}

const intersectionObserverInitialEntry: IntersectionObserverEntry = {
    target: null,
    time: null,
    isVisible: false,
    isIntersecting: false,
    intersectionRatio: 0,
    intersectionRect: null,
    boundingClientRect: null,
    rootBounds: null,
};

interface UseIntersectionObserverOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
    disabled?: boolean;
}

export const useIntersectionObserver = ({
    root = null,
    rootMargin = '0px',
    threshold = thresholdArray,
    disabled = false,
}: UseIntersectionObserverOptions = {}): UseObserverReturn<IntersectionObserverEntry> =>
    useObserver(
        typeof window !== 'undefined' ? IntersectionObserver : null,
        {
            root,
            rootMargin,
            threshold,
            disabled,
        },
        intersectionObserverInitialEntry,
    );

/**
 * Resize Observer
 */
interface ResizeObserverEntry {
    target: Element | null;
    contentRect: DOMRectReadOnly | null;
    contentBoxSize: ReadonlyArray<ResizeObserverSize> | null;
    borderBoxSize: ReadonlyArray<ResizeObserverSize> | null;
}

const resizeObserverInitialEntry: ResizeObserverEntry = {
    target: null,
    contentRect: null,
    contentBoxSize: null,
    borderBoxSize: null,
};

interface UseResizeObserverOptions {
    disabled?: boolean;
}

export const useResizeObserver = ({
    disabled = false,
}: UseResizeObserverOptions = {}): UseObserverReturn<ResizeObserverEntry> =>
    useObserver(
        typeof window !== 'undefined' ? ResizeObserver : null,
        { disabled },
        resizeObserverInitialEntry,
    );
