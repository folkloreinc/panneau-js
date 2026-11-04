import type { Field } from '@panneau/protocol';
import { usePanneauIntl } from '@panneau/ui';

import { CodeComboBox } from '../shared/CodeComboBox';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { TextField } from '../text/TextField';
import { FlagImage } from './RegionFlag';
import { getRegionFlag, useRegionFlags } from './flags';
import { getRegions } from './regions';

export interface RegionFieldProps extends FieldProps<string> {
    /** The country of the region (`CA`). Without it, or for a country without known regions, a text. */
    country?: string | null;
    placeholder?: string;
    controlClassName?: string;
}

/**
 * A state, a province or a territory of a country. For the countries that Panneau knows the
 * regions of, a combo box of their names in the user's locale, whose value is the code of the
 * region without its country (`QC`), with their flags for the countries that have them (Canada and
 * the United States). For the others, the region as typed.
 */
export function RegionField({ country, placeholder, ...props }: RegionFieldProps) {
    const intl = usePanneauIntl();
    const flags = useRegionFlags(country);
    const regions = getRegions(country, intl.locale);
    if (regions === null) {
        return (
            <TextField
                autoComplete="address-level1"
                {...props}
                {...(placeholder !== undefined ? { placeholder } : {})}
            />
        );
    }
    return (
        <CodeComboBox
            {...props}
            choices={regions.map((region) => {
                const flag = getRegionFlag(flags, region.code);
                return flag !== undefined
                    ? { ...region, prefix: <FlagImage src={flag} /> }
                    : region;
            })}
            placeholder={placeholder ?? intl.formatMessage(messages.regionPlaceholder)}
            emptyMessage={intl.formatMessage(messages.noRegions)}
        />
    );
}

/**
 * The country of a `region` field: the value of the field that `from` names in the same object,
 * or `settings.country`.
 */
export function getRegionCountry(field: Field, parentValue: unknown): string | null {
    if (field.from !== undefined && parentValue !== null && typeof parentValue === 'object') {
        const country = (parentValue as Record<string, unknown>)[field.from];
        if (isString(country) && country !== '') {
            return country;
        }
    }
    return getSetting(field, 'country', isString) ?? null;
}

/** The `region` type: its country from `from` or `settings.country`. */
export function RegionFieldEntry(props: FieldEntryProps) {
    return (
        <RegionField
            {...getFieldProps(props)}
            country={getRegionCountry(props.field, props.parentValue)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
