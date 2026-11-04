import { X } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

import type { AddressPart, AddressValue, Field } from '@panneau/protocol';
import {
    DEFAULT_ADDRESS_REQUIRED_PARTS,
    getAddressRequiredParts,
    normalizePostalCode,
} from '@panneau/protocol/runtime';
import { ComboBox, Fieldset, IconButton, usePanneauIntl } from '@panneau/ui';

import { CountryField } from '../country/CountryField';
import { OPEN_STREET_MAP_TILES } from '../location/LocationField';
import { LocationMap, type Point } from '../location/LocationMap';
import { SEARCH_MIN_LENGTH, useAddressSearch } from '../location/search';
import type { GeocodingResult, GeocodingSource, MapTiles } from '../location/types';
import { RegionField } from '../region/RegionField';
import { useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps, getSetting, isBoolean, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import { BoundPart, type BoundPartProps } from '../shared/part';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { TextField } from '../text/TextField';
import styles from './AddressField.module.css';
import { cleanAddress, endsWithRegion, isAddress } from './address';

export interface AddressFieldProps extends FieldProps<AddressValue> {
    /** Dot path of the value, the prefix of the paths of its parts. Defaults to `name`. */
    path?: string;
    /** The country of a new address (`CA`), set as soon as a part is typed. */
    country?: string | null;
    /** The countries the field allows. With one, the field doesn't show the country. */
    countries?: readonly string[];
    /** Countries shown first: `['CA', 'US']`. */
    preferred?: readonly string[];
    /** The parts a filled address must have, marked as required. */
    requiredParts?: readonly AddressPart[];
    /** Adds a map under the parts, and the point of the address to the value. */
    point?: boolean;
    /** The address search. Defaults to that of the `FieldsProvider`; without one, there is none. */
    geocoding?: GeocodingSource | null;
    /** The tiles of the map. Defaults to those of the `FieldsProvider`, or OpenStreetMap's. */
    tiles?: MapTiles;
    /** Zoom of the map on a point. Defaults to 16. */
    zoom?: number;
}

const WORLD: Point = { lat: 20, lng: 0 };

/** The type of the field of each part, for the binding of the fields context. */
const PART_TYPES: Readonly<Record<AddressPart, string>> = {
    country: 'country',
    street: 'text',
    unit: 'text',
    city: 'text',
    region: 'region',
    postalCode: 'text',
};

/**
 * A postal address (decision 0054): the country first, which sets the labels, the order and the
 * regions of the other parts, then the street, the unit, the city, the region and the postal
 * code, which is normalized for the country when it loses focus. With an address search, a place
 * found fills every part; with `point`, a map places the address. Each part shows the errors of
 * its own path (`address.postalCode`) in a form.
 */
export function AddressField({
    value,
    onChange,
    onBlur,
    path,
    name,
    country: countryProp,
    countries,
    preferred,
    requiredParts = DEFAULT_ADDRESS_REQUIRED_PARTS,
    point: withPoint = false,
    geocoding: geocodingProp,
    tiles: tilesProp,
    zoom = 16,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    className,
}: AddressFieldProps) {
    const intl = usePanneauIntl();
    const { maps } = useFieldsContext();
    const geocoding = geocodingProp === undefined ? (maps?.geocoding ?? null) : geocodingProp;
    const tiles = tilesProp ?? maps?.tiles ?? OPEN_STREET_MAP_TILES;
    const editable = disabled !== true && readOnly !== true;
    const base = path ?? name ?? '';
    const onlyCountry = countries?.length === 1 ? countries[0] : undefined;
    const defaultCountry = onlyCountry ?? countryProp ?? null;
    const address: AddressValue = value ?? {};
    const country = address.country ?? defaultCountry;
    const filled = value !== null && value !== undefined;

    const change = (next: Partial<Record<keyof AddressValue, unknown>>) =>
        onChange?.(cleanAddress(next, defaultCountry));
    const setPart = (part: AddressPart, text: string | null) =>
        change({ ...address, [part]: text ?? undefined });
    // A region belongs to its country, and a postal code is written as in its country
    const setCountry = (next: string | null) =>
        change({
            ...address,
            country: next ?? undefined,
            region: next === country ? address.region : undefined,
            postalCode:
                address.postalCode !== undefined
                    ? normalizePostalCode(address.postalCode, next)
                    : undefined,
        });

    const [query, setQuery] = useState('');
    const [chosen, setChosen] = useState<GeocodingResult | null>(null);
    const search = useAddressSearch(
        editable && query !== chosen?.label ? geocoding : null,
        query,
        intl.locale,
    );
    // A place chosen moves focus to the unit, the part it doesn't fill, which closes the results
    const unitRef = useRef<HTMLDivElement>(null);
    const focusUnit = () =>
        window.requestAnimationFrame(() =>
            unitRef.current?.querySelector<HTMLInputElement>('input')?.focus(),
        );
    const places = (chosen !== null && query === chosen.label ? [chosen] : search.results).filter(
        (result) => result.address !== undefined,
    );

    const labels: Record<AddressPart, string> = {
        country: intl.formatMessage(messages.addressCountry),
        street: intl.formatMessage(messages.addressStreet),
        unit: intl.formatMessage(messages.addressUnit),
        city: intl.formatMessage(messages.addressCity),
        region: intl.formatMessage(
            country === 'CA'
                ? messages.addressProvince
                : country === 'US'
                  ? messages.addressState
                  : messages.addressRegion,
        ),
        postalCode: intl.formatMessage(
            country === 'US' ? messages.addressZipCode : messages.addressPostalCode,
        ),
    };

    const renderPart = (part: AddressPart, input: (bound: BoundPartProps) => ReactNode) => {
        const field: Field = { name: part, type: PART_TYPES[part], label: labels[part] };
        return (
            <div
                key={part}
                className={cx(styles.part, styles[part])}
                {...(part === 'unit' ? { ref: unitRef } : {})}
            >
                <BoundPart
                    field={field}
                    path={base !== '' ? `${base}.${part}` : part}
                    {...(onBlur !== undefined ? { onBlur } : {})}
                    render={input}
                />
            </div>
        );
    };
    const shared = (part: AddressPart, bound: BoundPartProps) => ({
        label: labels[part],
        errors: bound.errors ?? [],
        ...(disabled !== undefined ? { disabled } : {}),
        ...(readOnly !== undefined ? { readOnly } : {}),
        required: requiredParts.includes(part) && (required === true || filled),
    });
    const textPart = (part: 'street' | 'unit' | 'city', autoComplete: string) =>
        renderPart(part, (bound) => (
            <TextField
                {...shared(part, bound)}
                autoComplete={autoComplete}
                value={address[part] ?? null}
                onChange={(text) => setPart(part, text)}
                {...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {})}
            />
        ));

    const region = renderPart('region', (bound) => (
        <RegionField
            {...shared('region', bound)}
            country={country}
            value={address.region ?? null}
            onChange={(text) => setPart('region', text)}
            {...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {})}
        />
    ));
    const postalCode = renderPart('postalCode', (bound) => (
        <TextField
            {...shared('postalCode', bound)}
            autoComplete="postal-code"
            value={address.postalCode ?? null}
            onChange={(text) => setPart('postalCode', text)}
            onBlur={() => {
                if (address.postalCode !== undefined) {
                    const normalized = normalizePostalCode(address.postalCode, country);
                    if (normalized !== address.postalCode) {
                        setPart('postalCode', normalized);
                    }
                }
                bound.onBlur?.();
            }}
        />
    ));
    const city = textPart('city', 'address-level2');
    const locality = endsWithRegion(country)
        ? [city, region, postalCode]
        : [postalCode, city, region];

    const point = address.point ?? null;
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            isDisabled={disabled}
            className={className}
        >
            <div className={styles.address}>
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
                                change({
                                    ...result.address,
                                    ...(withPoint ? { point: roundPoint(result) } : {}),
                                });
                                focusUnit();
                            }
                        }}
                    />
                ) : null}
                <div className={styles.parts}>
                    {onlyCountry === undefined
                        ? renderPart('country', (bound) => (
                              <CountryField
                                  {...shared('country', bound)}
                                  {...(countries !== undefined ? { countries } : {})}
                                  {...(preferred !== undefined ? { preferred } : {})}
                                  value={country}
                                  onChange={setCountry}
                                  {...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {})}
                              />
                          ))
                        : null}
                    {textPart('street', 'address-line1')}
                    {textPart('unit', 'address-line2')}
                    {locality}
                </div>
                {withPoint ? (
                    <div className={styles.map}>
                        <LocationMap
                            point={point}
                            onChange={(next) => change({ ...address, point: roundPoint(next) })}
                            tiles={tiles}
                            center={point ?? WORLD}
                            zoom={zoom}
                            readOnly={!editable}
                            label={intl.formatMessage(messages.map, {
                                label: typeof label === 'string' ? label : '',
                            })}
                        />
                        {editable && point !== null ? (
                            <IconButton
                                icon={X}
                                label={intl.formatMessage(messages.removePoint)}
                                className={styles.remove}
                                onPress={() => change({ ...address, point: undefined })}
                            />
                        ) : null}
                    </div>
                ) : null}
            </div>
        </Fieldset>
    );
}

/** A point to the sixth decimal, about ten centimetres. */
function roundPoint(point: Point): Point {
    return { lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) };
}

const isCodes = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(isString);

/**
 * The `address` type: settings `country`, `countries`, `preferred`, `required` (the parts a
 * filled address must have) and `point`, over the maps of the `FieldsProvider`.
 */
export function AddressFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const country = getSetting(field, 'country', isString);
    const countries = getSetting(field, 'countries', isCodes);
    const preferred = getSetting(field, 'preferred', isCodes);
    const point = getSetting(field, 'point', isBoolean);
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <AddressField
            {...fieldProps}
            path={props.path}
            value={isAddress(props.value) ? props.value : null}
            onChange={props.onChange}
            requiredParts={getAddressRequiredParts(field)}
            {...(country !== undefined ? { country } : {})}
            {...(countries !== undefined ? { countries } : {})}
            {...(preferred !== undefined ? { preferred } : {})}
            {...(point !== undefined ? { point } : {})}
        />
    );
}
