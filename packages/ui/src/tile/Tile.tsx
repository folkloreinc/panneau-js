import { type ReactNode, createContext, use } from 'react';
import { Link } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './Tile.module.css';

export type TileAppearance = 'plain' | 'outline' | 'subtle';

export interface TileProps {
    /** What the tile shows: a name, a file, a session. */
    title: ReactNode;
    /** A line under the title. */
    description?: ReactNode;
    /** More content under the description. */
    children?: ReactNode;
    /** An icon, in a rounded square. */
    icon?: IconComponent | undefined;
    /** A media other than an icon: an `Avatar`, a thumbnail. */
    media?: ReactNode;
    /** Buttons or a menu, at the end. They stay pressable on their own in a tile with a link. */
    actions?: ReactNode;
    /** Makes the whole tile a link, through the app's router: the title is the link. */
    href?: string | undefined;
    /** Opens the link in a new tab, without access to the admin. */
    external?: boolean;
    /** Defaults to `plain`. */
    appearance?: TileAppearance;
    /** Defaults to `md`. */
    size?: 'sm' | 'md';
    className?: string | undefined;
}

const TileGroupContext = createContext(false);

/** A row that shows one thing: a media, a title, a description, and actions. */
export function Tile({
    title,
    description,
    children,
    icon,
    media,
    actions,
    href,
    external = false,
    appearance = 'plain',
    size = 'md',
    className,
}: TileProps) {
    const inGroup = use(TileGroupContext);
    const Element = inGroup ? 'li' : 'div';
    return (
        <Element
            className={cx(
                'panneau-tile',
                styles.tile,
                styles[appearance],
                size === 'sm' && styles.sm,
                href !== undefined && styles.linked,
                className,
            )}
        >
            {media !== undefined && media !== null ? (
                <span className={styles.media}>{media}</span>
            ) : icon !== undefined ? (
                <span className={cx(styles.media, styles.icon)}>
                    <Icon icon={icon} size={size === 'sm' ? 'sm' : 'md'} />
                </span>
            ) : null}
            <div className={styles.content}>
                {href !== undefined ? (
                    <Link
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={cx(styles.title, styles.link)}
                    >
                        {title}
                    </Link>
                ) : (
                    <span className={styles.title}>{title}</span>
                )}
                {description !== undefined && description !== null ? (
                    <span className={styles.description}>{description}</span>
                ) : null}
                {children !== undefined && children !== null ? (
                    <div className={styles.children}>{children}</div>
                ) : null}
            </div>
            {actions !== undefined && actions !== null ? (
                <div className={styles.actions}>{actions}</div>
            ) : null}
        </Element>
    );
}

export interface TileGroupProps {
    /** `Tile`s: each one is an item of the list. */
    children?: ReactNode;
    /** `plain` (default) draws a line between the tiles; `outline` adds a border around them. */
    appearance?: 'plain' | 'outline';
    /** Names the list. */
    label?: string | undefined;
    className?: string | undefined;
}

/** A list of tiles, with a line between them. */
export function TileGroup({ children, appearance = 'plain', label, className }: TileGroupProps) {
    return (
        <ul
            aria-label={label}
            className={cx(
                'panneau-tile-group',
                styles.group,
                appearance === 'outline' && styles.groupOutline,
                className,
            )}
        >
            <TileGroupContext value>{children}</TileGroupContext>
        </ul>
    );
}
