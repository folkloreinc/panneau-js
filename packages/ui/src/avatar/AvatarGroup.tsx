import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import { Avatar, type AvatarSize, avatarStyles as styles } from './Avatar';

/** A person in an `AvatarGroup`. */
export interface AvatarGroupPerson {
    /** A key for the person, their name by default. */
    id?: string | number;
    name: string;
    src?: string | null | undefined;
    tone?: Tone | undefined;
    status?: string | undefined;
}

export interface AvatarGroupProps {
    people: readonly AvatarGroupPerson[];
    /** The most avatars shown: the others are counted in a "+2". Defaults to 3. */
    max?: number;
    /** Defaults to `sm`. */
    size?: AvatarSize;
    /** Names the group, instead of the list of names ("Ada Lovelace, Grace Hopper and 2 others"). */
    label?: string | undefined;
    className?: string | undefined;
}

/**
 * Overlapping avatars of several people, such as the people on a page. It is one image, named by
 * the list of their names, and each avatar shows its name on hover.
 */
export function AvatarGroup({ people, max = 3, size = 'sm', label, className }: AvatarGroupProps) {
    const intl = usePanneauIntl();
    const shown = people.slice(0, Math.max(0, max));
    const hidden = people.length - shown.length;
    const names = shown.map((person) =>
        person.status !== undefined && person.status !== ''
            ? intl.formatMessage(messages.avatarStatus, {
                  name: person.name,
                  status: person.status,
              })
            : person.name,
    );
    const groupLabel =
        label ??
        intl.formatList(
            hidden > 0
                ? [...names, intl.formatMessage(messages.avatarOthers, { count: hidden })]
                : names,
            { type: 'conjunction' },
        );
    return (
        <span
            role="img"
            aria-label={groupLabel}
            className={cx('panneau-avatar-group', styles.group, className)}
        >
            {shown.map((person, index) => (
                <Avatar
                    key={person.id ?? `${index}-${person.name}`}
                    name={person.name}
                    src={person.src}
                    tone={person.tone}
                    status={person.status}
                    size={size}
                />
            ))}
            {hidden > 0 ? (
                <span
                    aria-hidden="true"
                    className={cx(styles.avatar, styles[size], styles.more)}
                    title={intl.formatMessage(messages.avatarOthers, { count: hidden })}
                >
                    {intl.formatMessage(messages.avatarMore, { count: hidden })}
                </span>
            ) : null}
        </span>
    );
}
