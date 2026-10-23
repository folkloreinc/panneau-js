import type * as LeafletModule from 'leaflet';
import { useEffect, useRef } from 'react';

import styles from './LocationField.module.css';
import { LEAFLET_CSS } from './leafletCss';
import type { MapTiles } from './types';

type Leaflet = typeof LeafletModule;
type LeafletMap = LeafletModule.Map;
type LeafletMarker = LeafletModule.Marker;

const STYLE_ID = 'panneau-leaflet-css';

/** Adds Leaflet's stylesheet to the document of the map, once. */
function injectStyles(document: Document) {
    if (document.getElementById(STYLE_ID) === null) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = LEAFLET_CSS;
        document.head.append(style);
    }
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
    const container = useRef<HTMLDivElement>(null);
    const map = useRef<{ leaflet: Leaflet; map: LeafletMap; marker: LeafletMarker | null } | null>(
        null,
    );
    // The latest values, for the handlers of the map
    const latest = useRef({ onChange, readOnly });
    useEffect(() => {
        latest.current = { onChange, readOnly };
    });

    // Creates the map once Leaflet is loaded
    useEffect(() => {
        const element = container.current;
        if (element === null) {
            return undefined;
        }
        let cancelled = false;
        void import('leaflet').then((module) => {
            if (cancelled) {
                return;
            }
            const leaflet = ((module as { default?: Leaflet }).default ?? module) as Leaflet;
            injectStyles(element.ownerDocument);
            const instance = leaflet.map(element, { attributionControl: true });
            leaflet
                .tileLayer(tiles.url, {
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
        return () => {
            cancelled = true;
            map.current?.map.remove();
            map.current = null;
        };
        // The map is made once; later changes go through the effect below
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tiles.url]);

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

    const lat = point?.lat;
    const lng = point?.lng;
    useEffect(() => {
        sync(lat !== undefined && lng !== undefined ? { lat, lng } : null, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng]);

    return (
        <div
            ref={container}
            className={[styles.map, className].filter(Boolean).join(' ')}
            role="application"
            aria-label={label}
        />
    );
}
