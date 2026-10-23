import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { LocationValue } from '@panneau/protocol';
import {
    ComboBox,
    Fieldset,
    IconButton,
    NumberInput,
    TextInput,
    usePanneauIntl,
} from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import { getFieldProps, getSetting, isNumber, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './LocationField.module.css';
import { LocationMap, type Point } from './LocationMap';
import type { GeocodingResult, GeocodingSource, MapTiles } from './types';

export type { LocationValue };

/** OpenStreetMap's standard tiles: fine for an admin panel, with their credit. */
export const OPEN_STREET_MAP_TILES: MapTiles = {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
};

const SEARCH_DELAY = 400;
const SEARCH_MIN_LENGTH = 3;

export interface LocationFieldProps extends FieldProps<LocationValue> {
    /** The address search. Defaults to that of the `FieldsProvider`; without one, there is none. */
    geocoding?: GeocodingSource | null;
    /** The tiles of the map. Defaults to those of the `FieldsProvider`, or OpenStreetMap's. */
    tiles?: MapTiles;
    /** Where the map opens without a point. Defaults to the whole world. */
    center?: Point;
    /** Zoom of the map on a point. Defaults to 15. */
    zoom?: number;
}

/** Whether a value is a point. */
export function isLocation(value: unknown): value is LocationValue {
    return (
        value !== null &&
        typeof value === 'object' &&
        isNumber((value as Record<string, unknown>).lat) &&
        isNumber((value as Record<string, unknown>).lng)
    );
}

/** The search of addresses: results of the text typed, after a pause. */
function useAddressSearch(geocoding: GeocodingSource | null, query: string, locale: string) {
    const [state, setState] = useState<{
        query: string;
        results: GeocodingResult[];
        loading: boolean;
    }>({ query: '', results: [], loading: false });
    useEffect(() => {
        const text = query.trim();
        if (geocoding === null || text.length < SEARCH_MIN_LENGTH) {
            return undefined;
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setState((current) => ({ ...current, loading: true }));
            geocoding
                .search(text, { signal: controller.signal, locale })
                .then((results) => setState({ query: text, results, loading: false }))
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setState({ query: text, results: [], loading: false });
                    }
                });
        }, SEARCH_DELAY);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [geocoding, query, locale]);
    return query.trim().length >= SEARCH_MIN_LENGTH ? state : { ...state, results: [] };
}

/**
 * A point on a map, and its address. Clicking the map or dragging the marker places the point,
 * and its latitude and longitude can be typed. With an address search, a place found sets the
 * point and the address; with a reverse search, placing a point fills an empty address.
 */
export function LocationField({
    value,
    onChange,
    onBlur,
    geocoding: geocodingProp,
    tiles: tilesProp,
    center = { lat: 20, lng: 0 },
    zoom = 15,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    className,
}: LocationFieldProps) {
    const intl = usePanneauIntl();
    const { maps } = useFieldsContext();
    const geocoding = geocodingProp === undefined ? (maps?.geocoding ?? null) : geocodingProp;
    const tiles = tilesProp ?? maps?.tiles ?? OPEN_STREET_MAP_TILES;
    const editable = disabled !== true && readOnly !== true;
    const [query, setQuery] = useState('');
    // The place chosen: the search shows its label until something else is typed
    const [chosen, setChosen] = useState<GeocodingResult | null>(null);
    const search = useAddressSearch(
        editable && query !== chosen?.label ? geocoding : null,
        query,
        intl.locale,
    );
    const places = chosen !== null && query === chosen.label ? [chosen] : search.results;
    // A place chosen moves focus to its address, which closes the results
    const addressRef = useRef<HTMLDivElement>(null);
    const focusAddress = () =>
        window.requestAnimationFrame(() =>
            addressRef.current?.querySelector<HTMLInputElement>('input')?.focus(),
        );

    // The coordinates as typed: a value needs both
    const [draft, setDraft] = useState<{ source: unknown; lat: number | null; lng: number | null }>(
        { source: value, lat: value?.lat ?? null, lng: value?.lng ?? null },
    );
    if (draft.source !== value) {
        setDraft({ source: value, lat: value?.lat ?? null, lng: value?.lng ?? null });
    }

    const setPoint = (point: Point, address = value?.address) => {
        const next: LocationValue = {
            lat: Number(point.lat.toFixed(6)),
            lng: Number(point.lng.toFixed(6)),
            ...(address !== undefined && address !== '' ? { address } : {}),
        };
        onChange?.(next);
        // Fills an empty address from the point
        if ((address === undefined || address === '') && geocoding?.reverse !== undefined) {
            const controller = new AbortController();
            void geocoding
                .reverse(point, { signal: controller.signal, locale: intl.locale })
                .then((place) => {
                    if (place !== null) {
                        onChange?.({ ...next, address: place.label });
                    }
                })
                .catch(() => undefined);
        }
    };

    const setCoordinate = (key: 'lat' | 'lng', number: number | null) => {
        const next = { ...draft, [key]: number };
        setDraft(next);
        if (next.lat !== null && next.lng !== null) {
            setPoint({ lat: next.lat, lng: next.lng });
        } else if (next.lat === null && next.lng === null) {
            onChange?.(null);
        }
    };

    const point = isLocation(value) ? { lat: value.lat, lng: value.lng } : null;
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            isDisabled={disabled}
            className={className}
        >
            <div className={styles.location}>
                {editable && geocoding !== null ? (
                    <ComboBox
                        aria-label={intl.formatMessage(messages.searchAddress)}
                        placeholder={intl.formatMessage(messages.searchAddress)}
                        onInputChange={setQuery}
                        items={places.map((result, index) => ({
                            id: String(index),
                            label: result.label,
                        }))}
                        isLoading={search.loading}
                        menuTrigger="input"
                        emptyMessage={
                            query.trim().length < SEARCH_MIN_LENGTH
                                ? intl.formatMessage(messages.searchAddressHint, {
                                      count: SEARCH_MIN_LENGTH,
                                  })
                                : intl.formatMessage(messages.noPlaces)
                        }
                        value={chosen !== null && query === chosen.label ? '0' : null}
                        onChange={(id) => {
                            const result = id !== null ? places[Number(id)] : undefined;
                            if (result !== undefined) {
                                setChosen(result);
                                setPoint(result, result.label);
                                focusAddress();
                            }
                        }}
                    />
                ) : null}
                <LocationMap
                    point={point}
                    onChange={(next) => setPoint(next)}
                    tiles={tiles}
                    center={center}
                    zoom={zoom}
                    readOnly={!editable}
                    label={intl.formatMessage(messages.map, {
                        label: typeof label === 'string' ? label : '',
                    })}
                />
                <div className={styles.coordinates}>
                    <NumberInput
                        label={intl.formatMessage(messages.latitude)}
                        value={draft.lat}
                        onChange={(next) => setCoordinate('lat', next)}
                        onBlur={() => onBlur?.()}
                        minValue={-90}
                        maxValue={90}
                        step={0.000001}
                        formatOptions={{ maximumFractionDigits: 6 }}
                        isDisabled={disabled}
                        isReadOnly={readOnly}
                        className={styles.coordinate}
                    />
                    <NumberInput
                        label={intl.formatMessage(messages.longitude)}
                        value={draft.lng}
                        onChange={(next) => setCoordinate('lng', next)}
                        onBlur={() => onBlur?.()}
                        minValue={-180}
                        maxValue={180}
                        step={0.000001}
                        formatOptions={{ maximumFractionDigits: 6 }}
                        isDisabled={disabled}
                        isReadOnly={readOnly}
                        className={styles.coordinate}
                    />
                    {editable && point !== null ? (
                        <IconButton
                            icon={X}
                            label={intl.formatMessage(messages.removePoint)}
                            className={styles.remove}
                            onPress={() => onChange?.(null)}
                        />
                    ) : null}
                </div>
                {point !== null ? (
                    <div ref={addressRef}>
                        <TextInput
                            label={intl.formatMessage(messages.address)}
                            value={value?.address ?? ''}
                            onChange={(address) =>
                                onChange?.({
                                    lat: point.lat,
                                    lng: point.lng,
                                    ...(address !== '' ? { address } : {}),
                                })
                            }
                            onBlur={() => onBlur?.()}
                            isDisabled={disabled}
                            isReadOnly={readOnly}
                        />
                    </div>
                ) : null}
            </div>
        </Fieldset>
    );
}

function isPoint(value: unknown): value is Point {
    return isLocation(value);
}

/**
 * The `location` type: settings `zoom`, `center` (`{ "lat", "lng" }`, where the map opens without
 * a point) and `tiles` (`{ "url", "attribution" }`), over the maps of the `FieldsProvider`.
 */
export function LocationFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const zoom = getSetting(field, 'zoom', isNumber);
    const center = getSetting(field, 'center', isPoint);
    const tiles = getSetting(
        field,
        'tiles',
        (value): value is MapTiles =>
            value !== null &&
            typeof value === 'object' &&
            isString((value as Record<string, unknown>).url) &&
            isString((value as Record<string, unknown>).attribution),
    );
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <LocationField
            {...fieldProps}
            value={isLocation(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(zoom !== undefined ? { zoom } : {})}
            {...(center !== undefined ? { center } : {})}
            {...(tiles !== undefined ? { tiles } : {})}
        />
    );
}
