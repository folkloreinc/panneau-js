import { Time } from '@internationalized/date';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { TimeInput } from './TimeInput';

describe('TimeInput', () => {
    it('shows hours and minutes', () => {
        render(
            <PanneauRoot locale="fr-CA">
                <TimeInput label="Opens at" value={new Time(8, 5)} hourCycle={24} />
            </PanneauRoot>,
        );
        const segments = within(screen.getByRole('group', { name: 'Opens at' }))
            .getAllByRole('spinbutton')
            .map((segment) => segment.textContent);
        expect(segments).toEqual(['8', '05']);
    });

    it('shows its errors', () => {
        render(<TimeInput label="Opens at" errors={['Required.']} />);
        expect(screen.getByText('Required.')).toBeInTheDocument();
    });
});
