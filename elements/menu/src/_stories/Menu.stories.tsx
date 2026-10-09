import Menu from '../Menu';

export default {
    component: Menu,
    title: 'Elements/Menu',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <div style={{ position: 'relative' }}>
            <Menu
                items={[
                    { value: 'value', label: 'Label 1' },
                    { value: 'value', label: 'Label 2' },
                ]}
            />
        </div>
    ),
};

export const WithDropdown = {
    render: () => (
        <div style={{ position: 'relative' }}>
            <Menu
                items={[
                    { value: 'value', label: 'Label 1' },
                    {
                        value: 'value',
                        label: 'Label 2',
                        dropdown: [{ value: 'value', label: 'Sub Label 1' }],
                    },
                ]}
            />
        </div>
    ),
};

// Opening a dropdown closes the one that is open, in the same menu or in another one
export const WithDropdowns = {
    render: () => (
        <div style={{ position: 'relative', display: 'flex', gap: 20 }}>
            <Menu
                className="nav"
                itemClassName="nav-item"
                linkClassName="nav-link"
                items={[
                    {
                        id: 'first',
                        label: 'Dropdown 1',
                        dropdown: [
                            { id: 'first-1', label: 'Sub Label 1', href: '#1' },
                            { id: 'first-2', label: 'Sub Label 2', href: '#2' },
                        ],
                    },
                    {
                        id: 'second',
                        label: 'Dropdown 2',
                        dropdown: [{ id: 'second-1', label: 'Sub Label 3', href: '#3' }],
                    },
                ]}
            />
            <Menu
                className="nav"
                itemClassName="nav-item"
                linkClassName="nav-link"
                items={[
                    {
                        id: 'other',
                        label: 'Other menu',
                        dropdown: [{ id: 'other-1', label: 'Sub Label 4', href: '#4' }],
                    },
                ]}
            />
        </div>
    ),
};
