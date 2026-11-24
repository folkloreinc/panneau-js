import { Children, type ReactNode, createContext, isValidElement, use } from 'react';
import { Link } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { ReorderHandle, ReorderItem, ReorderList } from '../reorder/ReorderList';
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
/** The place of a tile in a group that reorders its tiles, and whether it shows its handle. */
const TileReorderContext = createContext<{ index: number; id: string; hasHandle: boolean } | null>(
    null,
);

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
    const reorder = use(TileReorderContext);
    const Element = inGroup ? 'li' : 'div';
    const classes = cx(
        'panneau-tile',
        styles.tile,
        styles[appearance],
        size === 'sm' && styles.sm,
        href !== undefined && styles.linked,
        className,
    );
    const content = (
        <>
            {reorder?.hasHandle === true ? <ReorderHandle className={styles.handle} /> : null}
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
        </>
    );
    return reorder !== null ? (
        <ReorderItem id={reorder.id} index={reorder.index} className={classes}>
            {content}
        </ReorderItem>
    ) : (
        <Element className={classes}>{content}</Element>
    );
}

export interface TileGroupProps {
    /** `Tile`s: each one is an item of the list. */
    children?: ReactNode;
    /** `plain` (default) draws a line between the tiles; `outline` adds a border around them. */
    appearance?: 'plain' | 'outline';
    /** Names the list. */
    label?: string | undefined;
    /**
     * Makes the tiles reorderable (decision 0111): each one has a handle before its media, which
     * drags it, and `onMove` is called with its index and the index it takes. The tiles keep their
     * keys, which stay when they move. A `ReorderMenu` in the actions of a tile moves it too.
     */
    onMove?: ((from: number, to: number) => void) | undefined;
    /** The name of a tile, in the labels of its handle and in announcements. */
    itemLabel?: ((index: number) => string) | undefined;
    /** The tiles can't be reordered: they have no handle. */
    isReorderDisabled?: boolean | undefined;
    className?: string | undefined;
}

/** A list of tiles, with a line between them. */
export function TileGroup({
    children,
    appearance = 'plain',
    label,
    onMove,
    itemLabel,
    isReorderDisabled = false,
    className,
}: TileGroupProps) {
    const classes = cx(
        'panneau-tile-group',
        styles.group,
        appearance === 'outline' && styles.groupOutline,
        className,
    );
    if (onMove === undefined) {
        return (
            <ul aria-label={label} className={classes}>
                <TileGroupContext value>{children}</TileGroupContext>
            </ul>
        );
    }
    // Each tile knows its place, and its key is the key of the item that moves
    const tiles = Children.toArray(children);
    return (
        <ReorderList
            elementType="ul"
            aria-label={label}
            className={classes}
            itemCount={tiles.length}
            onMove={onMove}
            {...(itemLabel !== undefined ? { itemLabel } : {})}
            isDisabled={isReorderDisabled}
        >
            <TileGroupContext value>
                {tiles.map((tile, index) => {
                    const key = isValidElement(tile) && tile.key !== null ? tile.key : index;
                    return (
                        <TileReorderContext
                            key={key}
                            value={{ index, id: String(key), hasHandle: !isReorderDisabled }}
                        >
                            {tile}
                        </TileReorderContext>
                    );
                })}
            </TileGroupContext>
        </ReorderList>
    );
}
