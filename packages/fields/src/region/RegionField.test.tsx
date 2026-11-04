import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { GroupField } from '../group/GroupField';
import { DefinitionField } from '../shared/DefinitionField';
import { RegionField } from './RegionField';
import { RegionFlag } from './RegionFlag';
import { REGION_FLAG_COUNTRIES, loadRegionFlags } from './flags';
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

describe('region flags', () => {
    it('has a flag for every region of Canada and the United States', async () => {
        expect(REGION_FLAG_COUNTRIES).toEqual(['CA', 'US']);
        for (const country of REGION_FLAG_COUNTRIES) {
            const flags = await loadRegionFlags(country);
            const codes = getRegions(country, 'en')?.map((region) => region.code) ?? [];
            expect(Object.keys(flags ?? {}).sort()).toEqual(codes.sort());
            for (const code of codes) {
                expect(flags?.[code]).toMatch(/^data:image\/webp;base64,/);
            }
        }
    });

    it('has no flags for the other countries', async () => {
        await expect(loadRegionFlags('MX')).resolves.toBeNull();
        await expect(loadRegionFlags('toString')).resolves.toBeNull();
    });

    it('shows the flag of a region once loaded, as a decorative image', async () => {
        const { container } = render(
            <p>
                <RegionFlag country="CA" code="QC" />
                <RegionFlag country="CA" code="XX" />
                <RegionFlag country="MX" code="JAL" />
                <RegionFlag country={null} code="QC" />
            </p>,
        );
        await waitFor(() => expect(container.querySelectorAll('img')).toHaveLength(1));
        expect(container.querySelector('img')).toHaveAttribute('alt', '');
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

    it('shows the flags of the regions in the options and before the value', async () => {
        const { container } = renderField(
            <RegionField label="Province" country="CA" value="QC" onChange={() => undefined} />,
        );
        await waitFor(() => expect(container.querySelector('img')).not.toBeNull());
        expect(container.querySelector('img')).toHaveAttribute('alt', '');
        const input = screen.getByRole('combobox', { name: 'Province' });
        await userEvent.clear(input);
        await userEvent.type(input, 'ont');
        const option = screen.getByRole('option', { name: 'Ontario' });
        expect(option.querySelector('img')).toHaveAttribute('alt', '');
    });

    it('shows no flags for a country without them', async () => {
        const { container } = renderField(
            <RegionField label="State" country="MX" value="JAL" onChange={() => undefined} />,
        );
        await userEvent.click(screen.getByRole('combobox', { name: 'State' }));
        expect(container.ownerDocument.querySelector('img')).toBeNull();
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
