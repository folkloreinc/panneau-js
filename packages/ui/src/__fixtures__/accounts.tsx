/** Connected accounts for the stories of rich choices: a menu, a pill trigger, radio cards. */
export interface StoryAccount {
    id: string;
    name: string;
    handle: string;
    initials: string;
    color: string;
}

export const ACCOUNTS: readonly StoryAccount[] = [
    {
        id: 'studio',
        name: 'Studio Lumen',
        handle: '@studiolumen',
        initials: 'SL',
        color: '#1d4ed8',
    },
    { id: 'ada', name: 'Ada Lovelace', handle: '@ada', initials: 'AL', color: '#047857' },
    { id: 'grace', name: 'Grace Hopper', handle: '@grace', initials: 'GH', color: '#b91c1c' },
];

/** An avatar with initials, decorative: the name is next to it. */
export function StoryAvatar({ account }: { account: StoryAccount }) {
    return (
        <span
            aria-hidden="true"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: account.color,
            }}
        >
            {account.initials}
        </span>
    );
}
