import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

function buildThresholdArray(): number[] {
    return [0, 1.0];
}

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
    observer: InstanceType<NonNullable<ObserverConstructor<T>>>;
}

interface ObserverOptions {
    root?: Element | null;
    rootMargin?: string | null;
    threshold?: number | number[] | null;
    disabled?: boolean;
}

const observersCache = new Map<ObserverConstructor<any>, Record<string, ObserverWrapper<any>>>();

// Give each root element a unique id so observers with different roots are not shared
const rootIds = new WeakMap<Element, number>();
let lastRootId = 0;

function getRootId(root: Element): number {
    if (!rootIds.has(root)) {
        lastRootId += 1;
        rootIds.set(root, lastRootId);
    }
    return rootIds.get(root)!;
}

function getOptionsKey({ root = null, rootMargin, threshold = null }: ObserverOptions): string {
    const rootKey = root !== null ? getRootId(root) : null;
    return `root_${rootKey}_rootMargin_${rootMargin || null}_threshold_${threshold}`;
}

function createObserver<T>(
    Observer: NonNullable<ObserverConstructor<T>>,
    options: Record<string, unknown> = {},
): ObserverWrapper<T> {
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
}

export function getObserver<T>(
    Observer: ObserverConstructor<T>,
    options: ObserverOptions = {},
): ObserverWrapper<T> {
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
}

interface UseObserverReturn<T> {
    ref: RefObject<Element>;
    entry: T;
}

interface ObserverSubscription<T> {
    element: Element | null;
    Observer: ObserverConstructor<T>;
    disabled: boolean;
    root: Element | null;
    rootMargin: string | null;
    threshold: number | number[] | null;
    unsubscribe: ((element: Element, callback: (entry: T) => void) => void) | null;
    callback: (entry: T) => void;
}

export function useObserver<T>(
    Observer: ObserverConstructor<T>,
    opts: ObserverOptions = {},
    initialEntry: T = {} as T,
): UseObserverReturn<T> {
    const { root = null, rootMargin = null, threshold = null, disabled = false } = opts;
    const [entry, setEntry] = useState<T>(initialEntry);
    const nodeRef = useRef<Element>(null);
    const subscriptionRef = useRef<ObserverSubscription<T> | null>(null);

    // Runs after every commit so a change of the referenced element is detected
    // (refs can't be read during render). The subscription is only renewed when
    // the element or the observer options changed.
    useEffect(() => {
        const { current: nodeElement } = nodeRef;
        const { current: currentSubscription } = subscriptionRef;
        if (
            currentSubscription !== null &&
            currentSubscription.element === nodeElement &&
            currentSubscription.Observer === Observer &&
            currentSubscription.disabled === disabled &&
            currentSubscription.root === root &&
            currentSubscription.rootMargin === rootMargin &&
            currentSubscription.threshold === threshold
        ) {
            return;
        }

        if (
            currentSubscription !== null &&
            currentSubscription.unsubscribe !== null &&
            currentSubscription.element !== null
        ) {
            currentSubscription.unsubscribe(
                currentSubscription.element,
                currentSubscription.callback,
            );
        }

        const callback = (newEntry: T) => setEntry(newEntry);
        let unsubscribe: ((element: Element, callback: (entry: T) => void) => void) | null = null;
        if (!disabled && nodeElement !== null && Observer !== null) {
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
        subscriptionRef.current = {
            element: nodeElement,
            Observer,
            disabled,
            root,
            rootMargin,
            threshold,
            unsubscribe,
            callback,
        };
    });

    // Unsubscribe on unmount
    useEffect(
        () => () => {
            const { current: currentSubscription } = subscriptionRef;
            if (
                currentSubscription !== null &&
                currentSubscription.unsubscribe !== null &&
                currentSubscription.element !== null
            ) {
                currentSubscription.unsubscribe(
                    currentSubscription.element,
                    currentSubscription.callback,
                );
            }
            subscriptionRef.current = null;
        },
        [],
    );

    return {
        ref: nodeRef,
        entry,
    };
}

/**
 * Intersection Observer
 */
const thresholdArray = buildThresholdArray();

interface IntersectionObserverEntry {
    target: Element | null;
    time: number | null;
    // Only in Intersection Observer v2
    isVisible?: boolean;
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

export function useIntersectionObserver({
    root = null,
    rootMargin = '0px',
    threshold = thresholdArray,
    disabled = false,
}: UseIntersectionObserverOptions = {}): UseObserverReturn<IntersectionObserverEntry> {
    return useObserver<IntersectionObserverEntry>(
        typeof window !== 'undefined' ? IntersectionObserver : null,
        {
            root,
            rootMargin,
            threshold,
            disabled,
        },
        intersectionObserverInitialEntry,
    );
}

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

export function useResizeObserver({
    disabled = false,
}: UseResizeObserverOptions = {}): UseObserverReturn<ResizeObserverEntry> {
    return useObserver<ResizeObserverEntry>(
        typeof window !== 'undefined' ? ResizeObserver : null,
        { disabled },
        resizeObserverInitialEntry,
    );
}
