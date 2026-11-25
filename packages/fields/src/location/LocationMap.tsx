import type * as LeafletModule from 'leaflet';
import { type FocusEvent, useEffect, useEffectEvent, useRef, useState } from 'react';

import { isApplePlatform, usePanneauIntl } from '@panneau/ui';

import { messages } from '../shared/messages';
import styles from './LocationField.module.css';
import { LEAFLET_CSS } from './leafletCss';
import type { MapTiles } from './types';

type Leaflet = typeof LeafletModule;
type LeafletMap = LeafletModule.Map;
type LeafletMarker = LeafletModule.Marker;

const STYLE_ID = 'panneau-leaflet-css';

/** How long the hint to zoom stays, after a scroll the map let through. */
const HINT_DURATION = 1500;

/** Loads Leaflet, outside the component: the React Compiler doesn't handle `import()`. */
async function loadLeaflet(): Promise<Leaflet> {
    const module = await import('leaflet');
    return ((module as { default?: Leaflet }).default ?? module) as Leaflet;
}

/** Adds Leaflet's stylesheet to the document of the map, once. */
function injectStyles(document: Document) {
    if (document.getElementById(STYLE_ID) === null) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = LEAFLET_CSS;
        document.head.append(style);
    }
}

/**
 * Cancels the zoom that Leaflet's wheel handler waits to make (it waits for the wheel to stop, 40ms
 * by default). `remove()` leaves that timer running, and the zoom then reads the panes of the
 * removed map, and throws. The timer is private to Leaflet (1.9).
 */
function stopWheelZoom(instance: LeafletMap) {
    const handler = instance.scrollWheelZoom as unknown as {
        _timer?: ReturnType<typeof setTimeout>;
    };
    clearTimeout(handler._timer);
}

export interface Point {
    lat: number;
    lng: number;
}

export interface LocationMapProps {
    point: Point | null;
    /** Called with the point clicked, or where the marker was dropped. */
    onChange?: (point: Point) => void;
    tiles: MapTiles;
    /** Where the map opens without a point. */
    center: Point;
    /** Zoom of the map on a point; the map opens wider without one. */
    zoom: number;
    readOnly?: boolean;
    /** Accessible name of the map. */
    label: string;
    className?: string;
}

/**
 * A Leaflet map with a marker on the point. Clicking the map or dragging the marker moves the
 * point. Leaflet and its stylesheet load when the map first shows.
 *
 * The wheel scrolls the page over the map, which zooms with its buttons, a pinch, a double click,
 * the + and − keys, and the wheel with ⌘ or Ctrl held, or once it has been clicked or focused.
 */
export function LocationMap({
    point,
    onChange,
    tiles,
    center,
    zoom,
    readOnly = false,
    label,
    className,
}: LocationMapProps) {
    const intl = usePanneauIntl();
    const container = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    // Whether the focus is in the map: the wheel zooms it then
    const active = useRef(false);
    const [hinted, setHinted] = useState(false);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const map = useRef<{ leaflet: Leaflet; map: LeafletMap; marker: LeafletMarker | null } | null>(
        null,
    );
    // The latest values, for the handlers of the map
    const latest = useRef({ onChange, readOnly });
    useEffect(() => {
        latest.current = { onChange, readOnly };
    });

    /** Puts the marker on the point, and the point in view. */
    function sync(next: Point | null, pan: boolean) {
        const current = map.current;
        if (current === null) {
            return;
        }
        if (next === null) {
            current.marker?.remove();
            current.marker = null;
            return;
        }
        if (current.marker === null) {
            const marker = current.leaflet
                .marker(next, {
                    draggable: !latest.current.readOnly,
                    keyboard: false,
                    icon: current.leaflet.divIcon({
                        className: styles.marker,
                        // Leaflet places the icon with `transform`: the pin turns inside it
                        html: `<span class="${styles.pin}"></span>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 29],
                    }),
                })
                .addTo(current.map);
            marker.on('dragend', () => {
                const position = marker.getLatLng();
                latest.current.onChange?.({ lat: position.lat, lng: position.lng });
            });
            current.marker = marker;
        } else {
            current.marker.setLatLng(next);
        }
        if (pan && !current.map.getBounds().contains(next)) {
            current.map.setView(next, Math.max(current.map.getZoom(), zoom));
        }
    }

    // Creates the map once Leaflet is loaded, with the latest props. It is made again for other
    // tiles only: later points go through the effect below.
    const create = useEffectEvent((leaflet: Leaflet, element: HTMLDivElement, url: string) => {
        injectStyles(element.ownerDocument);
        const instance = leaflet.map(element, { attributionControl: true });
        leaflet
            .tileLayer(url, {
                attribution: tiles.attribution,
                maxZoom: tiles.maxZoom ?? 19,
            })
            .addTo(instance);
        instance.on('click', (event) => {
            if (!latest.current.readOnly) {
                latest.current.onChange?.({ lat: event.latlng.lat, lng: event.latlng.lng });
            }
        });
        map.current = { leaflet, map: instance, marker: null };
        instance.setView(point ?? center, point !== null ? zoom : 2);
        sync(point, false);
    });
    const url = tiles.url;
    useEffect(() => {
        const element = container.current;
        if (element === null) {
            return undefined;
        }
        let cancelled = false;
        void loadLeaflet().then((leaflet) => {
            if (!cancelled) {
                create(leaflet, element, url);
            }
        });
        return () => {
            cancelled = true;
            if (map.current !== null) {
                stopWheelZoom(map.current.map);
                map.current.map.remove();
            }
            map.current = null;
        };
    }, [url]);

    // Over a map that isn't active, a scroll without ⌘ or Ctrl never reaches Leaflet, which
    // listens on the map below: the page scrolls, and the hint says how to zoom. A pinch on a
    // trackpad comes with Ctrl, and zooms.
    const showHint = useEffectEvent(() => {
        setHinted(true);
        clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setHinted(false), HINT_DURATION);
    });
    useEffect(() => {
        const element = frame.current;
        if (element === null) {
            return undefined;
        }
        const onWheel = (event: WheelEvent) => {
            if (active.current || event.ctrlKey || event.metaKey) {
                return;
            }
            event.stopPropagation();
            showHint();
        };
        element.addEventListener('wheel', onWheel, { capture: true, passive: true });
        return () => {
            element.removeEventListener('wheel', onWheel, { capture: true });
            clearTimeout(hintTimer.current);
        };
    }, []);
    const onFocus = () => {
        active.current = true;
        setHinted(false);
    };
    const onBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!(
            event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)
        )) {
            active.current = false;
        }
    };

    const lat = point?.lat;
    const lng = point?.lng;
    const show = useEffectEvent((next: Point | null) => sync(next, true));
    useEffect(() => {
        show(lat !== undefined && lng !== undefined ? { lat, lng } : null);
    }, [lat, lng]);

    return (
        <div
            ref={frame}
            className={[styles.mapFrame, className].filter(Boolean).join(' ')}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            <div ref={container} className={styles.map} role="application" aria-label={label} />
            {/* For the pointer only: the keyboard zooms with + and − */}
            <div className={styles.zoomHint} data-visible={hinted || undefined} aria-hidden="true">
                <span className={styles.zoomHintText}>
                    {intl.formatMessage(messages.mapZoomHint, {
                        key: isApplePlatform() ? '⌘' : 'Ctrl',
                    })}
                </span>
            </div>
        </div>
    );
}
