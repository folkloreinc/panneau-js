import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { GroupField } from '../group/GroupField';
import { DefinitionField } from '../shared/DefinitionField';
import { RegionField } from './RegionField';
import { REGION_COUNTRIES, getRegionName, getRegions } from './regions';

describe('regions', () => {
    it('knows the regions of nine countries, in English and French', () => {
        expect(REGION_COUNTRIES).toEqual(['AR', 'AU', 'BR', 'CA', 'CN', 'IN', 'JP', 'MX', 'US']);
        expect(getRegions('CA', 'fr')?.map((region) => region.code)).toHaveLength(13);
        expect(getRegionName('CA', 'BC', 'fr')).toBe('Colombie-Britannique');
        expect(getRegionName('CA', 'BC', 'en')).toBe('British Columbia');
        expect(getRegionName('CA', 'BC', 'de')).toBe('British Columbia');
        expect(getRegionName('JP', '13', 'fr')).toBe('Tokyo');
        expect(getRegions('DE', 'en')).toBeNull();
        expect(getRegionName('DE', 'BY', 'en')).toBeNull();
    });

    it('sorts regions by name in the locale', () => {
        const names = getRegions('CA', 'fr')?.map((region) => region.name) ?? [];
        expect(names.slice(0, 3)).toEqual([
            'Alberta',
            'Colombie-Britannique',
            'Île-du-Prince-Édouard',
        ]);
    });
});

describe('RegionField', () => {
    it('picks a region of its country by name, and gives its code', async () => {
        const onChange = vi.fn();
        renderField(<RegionField label="Province" country="CA" value={null} onChange={onChange} />);
        await userEvent.type(screen.getByRole('combobox', { name: 'Province' }), 'queb');
        await userEvent.click(screen.getByRole('option', { name: 'Quebec' }));
        expect(onChange).toHaveBeenCalledWith('QC');
    });

    it('is a text for a country whose regions Panneau does not know', () => {
        renderField(<RegionField label="Region" country="DE" value="Bayern" />);
        expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('Bayern');
    });

    it('takes its country from the field that `from` names, or from its settings', () => {
        renderField(
            <GroupField
                label="Address"
                fields={[
                    { name: 'country', type: 'country', label: 'Country' },
                    {
                        name: 'state',
                        type: 'region',
                        label: 'State',
                        from: 'country',
                        settings: { country: 'CA' },
                    },
                ]}
                value={{ country: 'US', state: 'CA' }}
            />,
        );
        expect(screen.getByRole('combobox', { name: 'State' })).toHaveValue('California');
    });

    it('falls back on the country of its settings', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'province',
                    type: 'region',
                    label: 'Province',
                    from: 'country',
                    settings: { country: 'CA' },
                }}
                path="province"
                value="QC"
                parentValue={{ country: null }}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('combobox', { name: 'Province' })).toHaveValue('Quebec');
    });
});
