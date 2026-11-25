import { ArrowUpDown, GripVertical } from 'lucide-react';
import {
    type CSSProperties,
    type DragEvent,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
    type RefObject,
    createContext,
    use,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { type DragPreviewRenderer, useDrag, useDrop } from 'react-aria-components';

import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { cx } from '../utils/cx';
import { prefersReducedMotion } from '../utils/motion';
import styles from './ReorderList.module.css';
import {
    REORDER_DRAG_TYPE,
    gapAt,
    gapAtPoint,
    indexForGap,
    isSameGap,
    parseDuration,
} from './reorder';

/** How an item is moved: the pointer and touch use the browser's drag and drop. */
type DragMode = 'pointer' | 'keyboard' | 'menu';

/** Where an item is on the page, before a move. */
interface Position {
    left: number;
    top: number;
}

interface Drag {
    index: number;
    id: string;
    mode: DragMode;
}

interface ReorderContextValue {
    /** The type of the dragged data: only this list takes its items. */
    type: string;
    count: number;
    isDisabled: boolean;
    layout: 'stack' | 'grid';
    drag: Drag | null;
    /** The gap under the pointer while an item is dragged with it. */
    pointerGap: number | null;
    labelOf: (index: number) => string;
    start: (drag: Drag) => void;
    end: () => void;
    drop: (gap: number) => void;
    /** Moves an item to an index, from its menu. */
    move: (from: number, to: number) => void;
    list: RefObject<HTMLElement | null>;
    /** Whether the handle of an item takes the focus, once it moved with the keyboard: once. */
    takeFocus: (id: string) => boolean;
    /** Where the items were before a move, so that they move from there. */
    takePosition: (id: string, at: Position) => Position | undefined;
}

const ReorderContext = createContext<ReorderContextValue | null>(null);
const ReorderItemContext = createContext<{ index: number; id: string } | null>(null);

function useReorder(): ReorderContextValue {
    const context = use(ReorderContext);
    if (context === null) {
        throw new Error('ReorderItem and ReorderHandle go inside a ReorderList.');
    }
    return context;
}

function useReorderItem(): { index: number; id: string } {
    const item = use(ReorderItemContext);
    if (item === null) {
        throw new Error('ReorderHandle goes inside a ReorderItem.');
    }
    return item;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T): void {
    if (typeof ref === 'function') {
        ref(node);
    } else if (ref !== null && ref !== undefined) {
        ref.current = node;
    }
}

/** The items of a list, in their order. */
function itemsOf(list: HTMLElement | null): HTMLElement[] {
    return list !== null
        ? [...list.querySelectorAll<HTMLElement>(':scope > [data-reorder-item]')]
        : [];
}

export interface ReorderListProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    /** The items: a `ReorderItem` for each, in their order. */
    children?: ReactNode;
    /** How many items the list has. */
    itemCount: number;
    /**
     * Called when an item is dropped at another place, with its index and the index it takes. The
     * list doesn't change its order itself: the caller moves the item in its value.
     */
    onMove: (from: number, to: number) => void;
    /** The name of an item, in the labels of handles and places and in announcements. */
    itemLabel?: (index: number) => string;
    /** Items can't be dragged. */
    isDisabled?: boolean;
    /**
     * How the items are laid out: one under the other (`stack`, the default), or in rows of a grid,
     * as the tiles of a gallery, where an item goes before or after the item beside the pointer.
     */
    layout?: 'stack' | 'grid';
    /** Defaults to `ol`. */
    elementType?: 'ol' | 'ul' | 'div';
    ref?: Ref<HTMLElement>;
    className?: string;
    style?: CSSProperties;
}

/**
 * A list whose items are reordered by dragging a handle (decision 0111): with the pointer and touch
 * through the browser's drag and drop, and with the keyboard and screen readers through React
 * Aria's. Each item is a `ReorderItem` with a `ReorderHandle` inside; the rest of the item keeps
 * its text, its fields and their focus. The list is controlled: it reports a move with `onMove`,
 * and says it in a status message.
 */
export function ReorderList({
    children,
    itemCount,
    onMove,
    itemLabel,
    isDisabled = false,
    layout = 'stack',
    elementType: Element = 'ol',
    ref,
    className,
    ...props
}: ReorderListProps) {
    const intl = usePanneauIntl();
    // Browsers write the types of dragged data in lowercase
    const type = `application/x-panneau-reorder-${useId()
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()}`;
    const list = useRef<HTMLElement | null>(null);
    const [drag, setDrag] = useState<Drag | null>(null);
    const [pointerGap, setPointerGap] = useState<number | null>(null);
    // Whether one of its items is dragged with the pointer: only then the list takes drops. Set at
    // once, unlike `drag`: a list inside an item lets the drags of other lists go through it.
    const [isPointerDrag, setPointerDrag] = useState(false);
    const [message, setMessage] = useState('');
    // Read by the handlers of drag and drop, outside of rendering
    const current = useRef<{ drag: Drag | null; gap: number | null }>({ drag: null, gap: null });
    const focusAfter = useRef<string | null>(null);
    const positions = useRef<Map<string, Position> | null>(null);

    const labelOf = (index: number) =>
        itemLabel?.(index) ?? intl.formatMessage(messages.reorderItem, { index: index + 1 });

    const setGap = (gap: number | null) => {
        if (current.current.gap !== gap) {
            current.current.gap = gap;
            setPointerGap(gap);
        }
    };

    const start = (next: Drag) => {
        current.current = { drag: next, gap: null };
        if (next.mode === 'pointer') {
            setPointerDrag(true);
            // A frame later, once the browser took the image of what is dragged
            requestAnimationFrame(() => {
                if (current.current.drag === next) {
                    setDrag(next);
                }
            });
        } else {
            // Items that still slide from a move end there: React Aria measures where they are to
            // pick the first place, the one nearest to the item
            for (const element of itemsOf(list.current)) {
                for (const animation of element.getAnimations?.() ?? []) {
                    animation.finish();
                }
            }
            setDrag(next);
        }
        setPointerGap(null);
    };
    const end = () => {
        current.current = { drag: null, gap: null };
        setDrag(null);
        setPointerDrag(false);
        setPointerGap(null);
    };
    /** Moves the item at `from` to `to`: it says so, and the items slide to their places. */
    const move = (from: number, to: number, id: string, mode: DragMode) => {
        // The items move from where they were to their new places
        positions.current = new Map(
            itemsOf(list.current).map((element) => {
                const rect = element.getBoundingClientRect();
                return [element.dataset.reorderId ?? '', { left: rect.left, top: rect.top }];
            }),
        );
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                positions.current = null;
            });
        });
        if (mode === 'keyboard') {
            focusAfter.current = id;
        }
        setMessage(
            intl.formatMessage(messages.reorderMoved, {
                item: labelOf(from),
                position: to + 1,
                count: itemCount,
            }),
        );
        onMove(from, to);
    };
    const drop = (gap: number) => {
        const dragged = current.current.drag;
        if (dragged === null || isSameGap(dragged.index, gap)) {
            return;
        }
        move(dragged.index, indexForGap(dragged.index, gap), dragged.id, dragged.mode);
    };

    // The pointer: the list takes the drop, at the gap nearest to the pointer. Only while one of
    // its own items is dragged: React Aria stops the events of a drag at a drop target, so a list
    // inside an item of another list, or inside a drop zone of files, would refuse their drags.
    const gapFor = (x: number, y: number) => {
        const element = list.current;
        if (element === null) {
            return null;
        }
        const origin = element.getBoundingClientRect();
        const boxes = itemsOf(element).map((item) => {
            const rect = item.getBoundingClientRect();
            return {
                left: rect.left - origin.left,
                top: rect.top - origin.top,
                width: rect.width,
                height: rect.height,
            };
        });
        return layout === 'grid'
            ? gapAtPoint(boxes, x, y, getComputedStyle(element).direction === 'rtl')
            : gapAt(
                  boxes.map((box) => box.top + box.height / 2),
                  y,
              );
    };
    const onPointerMove = (event: { x: number; y: number }) => setGap(gapFor(event.x, event.y));
    const { dropProps } = useDrop({
        ref: list,
        isDisabled: isDisabled || !isPointerDrag,
        getDropOperation: (types) =>
            types.has(type) && current.current.drag?.mode === 'pointer' ? 'move' : 'cancel',
        onDropEnter: onPointerMove,
        onDropMove: onPointerMove,
        onDropExit: () => setGap(null),
        // Where it is dropped, which may not have been dragged over yet
        onDrop: (event) => {
            const gap = gapFor(event.x, event.y) ?? current.current.gap;
            if (gap !== null) {
                drop(gap);
            }
        },
    });

    // A list that goes while an item is held with the keyboard puts it back: React Aria would
    // otherwise keep the rest of the page inert. Its listener of Escape stops the key there.
    useEffect(
        () => () => {
            if (current.current.drag?.mode === 'keyboard') {
                document.dispatchEvent(
                    new globalThis.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
                );
            }
        },
        [],
    );

    // While an item moves with the keyboard, the arrows go from one place to the next, and Space
    // drops it as Enter does. React Aria stops the keys on the document: this listens before it.
    const isKeyboard = drag?.mode === 'keyboard';
    const isGrid = layout === 'grid';
    useEffect(() => {
        if (!isKeyboard) {
            return;
        }
        const gaps = () => [
            ...(list.current?.querySelectorAll<HTMLElement>('[data-reorder-gap]') ?? []),
        ];
        const isRtl = list.current !== null && getComputedStyle(list.current).direction === 'rtl';
        // In a grid, the arrows across go from one place to the next too
        const forward = new Set([
            'ArrowDown',
            ...(isGrid ? [isRtl ? 'ArrowLeft' : 'ArrowRight'] : []),
        ]);
        const backward = new Set([
            'ArrowUp',
            ...(isGrid ? [isRtl ? 'ArrowRight' : 'ArrowLeft'] : []),
        ]);
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            const all = gaps();
            const index = all.findIndex((gap) => gap === document.activeElement);
            if (forward.has(event.key) || backward.has(event.key)) {
                const step = forward.has(event.key) ? 1 : -1;
                const next = index === -1 ? all.at(step === 1 ? 0 : -1) : all[index + step];
                next?.focus();
            }
        };
        const onKeyUp = (event: globalThis.KeyboardEvent) => {
            if (event.key === ' ') {
                document.activeElement?.dispatchEvent(
                    new globalThis.KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
                );
            }
        };
        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('keyup', onKeyUp, true);
        return () => {
            window.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('keyup', onKeyUp, true);
        };
    }, [isKeyboard, isGrid]);

    const context: ReorderContextValue = {
        type,
        count: itemCount,
        isDisabled,
        layout,
        drag,
        pointerGap,
        labelOf,
        start,
        end,
        drop,
        move: (from, to) => move(from, to, '', 'menu'),
        list,
        takeFocus: (id) => {
            if (focusAfter.current !== id) {
                return false;
            }
            focusAfter.current = null;
            return true;
        },
        // Where an item was before the move, once it is somewhere else
        takePosition: (id, at) => {
            const from = positions.current?.get(id);
            if (from === undefined || (from.left === at.left && from.top === at.top)) {
                return undefined;
            }
            positions.current?.delete(id);
            return from;
        },
    };

    return (
        <ReorderContext value={context}>
            <Element
                {...props}
                {...dropProps}
                ref={(node: HTMLElement | null) => {
                    list.current = node;
                    assignRef(ref, node);
                }}
                className={cx('panneau-reorder-list', className)}
                data-layout={layout}
                data-dragging={drag !== null || undefined}
            >
                {children}
            </Element>
            <span role="status" className={styles.status}>
                {message}
            </span>
        </ReorderContext>
    );
}

export interface ReorderItemProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'id'> {
    /** A key of the item that stays when it moves. */
    id: string | number;
    /** Its place in the list. */
    index: number;
    children?: ReactNode;
    /** Defaults to `li`. */
    elementType?: 'li' | 'div';
    ref?: Ref<HTMLElement>;
    className?: string;
    style?: CSSProperties;
}

/**
 * An item of a `ReorderList`. While an item is dragged, it shows where the item would go: a line
 * on its edge. After a move, items slide to their new places (`--panneau-duration-slow`), unless
 * motion is reduced. The element of the item, or one inside it marked `data-reorder-preview`,
 * such as its header, is the image that follows the pointer.
 */
export function ReorderItem({
    id,
    index,
    children,
    elementType: Element = 'li',
    ref,
    className,
    ...props
}: ReorderItemProps) {
    const context = useReorder();
    const element = useRef<HTMLElement | null>(null);
    const key = String(id);
    const { drag, count } = context;

    // After a move, the item slides from where it was
    useLayoutEffect(() => {
        const node = element.current;
        if (node === null) {
            return;
        }
        const rect = node.getBoundingClientRect();
        const from = context.takePosition(key, { left: rect.left, top: rect.top });
        if (from === undefined) {
            return;
        }
        const style = getComputedStyle(node);
        const duration = parseDuration(style.getPropertyValue('--panneau-duration-slow'));
        if (duration === 0 || prefersReducedMotion() || typeof node.animate !== 'function') {
            return;
        }
        const offset = `translate(${from.left - rect.left}px, ${from.top - rect.top}px)`;
        node.animate([{ transform: offset }, { transform: 'none' }], {
            duration,
            easing: style.getPropertyValue('--panneau-ease-out').trim() || 'ease-out',
        });
    });

    // After a move with the keyboard, the focus goes back to the handle of the item
    useEffect(() => {
        if (!context.takeFocus(key)) {
            return;
        }
        element.current?.querySelector<HTMLElement>('[data-reorder-handle]')?.focus();
    });

    const showGap = (gap: number) => drag !== null && !isSameGap(drag.index, gap);

    return (
        <ReorderItemContext value={{ index, id: key }}>
            <Element
                {...props}
                ref={(node: HTMLElement | null) => {
                    element.current = node;
                    assignRef(ref, node);
                }}
                className={cx('panneau-reorder-item', styles.item, className)}
                data-reorder-item
                data-reorder-id={key}
                data-dragging={drag?.id === key || undefined}
            >
                {showGap(index) ? <ReorderGap gap={index} /> : null}
                {children}
                {index === count - 1 && showGap(count) ? <ReorderGap gap={count} /> : null}
            </Element>
        </ReorderItemContext>
    );
}

/**
 * A place where the dragged item can go. With the keyboard, it is a drop target of React Aria:
 * Tab, Shift+Tab and the arrows go from one to the next, Enter or Space drops, and Escape
 * cancels.
 */
function ReorderGap({ gap }: { gap: number }) {
    const context = useReorder();
    const intl = usePanneauIntl();
    const ref = useRef<HTMLDivElement>(null);
    const isKeyboard = context.drag?.mode === 'keyboard';
    const { dropProps, isDropTarget } = useDrop({
        ref,
        isDisabled: !isKeyboard,
        getDropOperation: (types) => (types.has(context.type) ? 'move' : 'cancel'),
        onDrop: () => context.drop(gap),
    });
    const isAfter = gap === context.count;
    const label = intl.formatMessage(isAfter ? messages.reorderAfter : messages.reorderBefore, {
        item: context.labelOf(isAfter ? gap - 1 : gap),
    });
    const isActive = isKeyboard ? isDropTarget : context.pointerGap === gap;

    return (
        <div
            {...(isKeyboard
                ? {
                      ...dropProps,
                      role: 'button',
                      tabIndex: -1,
                      'aria-label': label,
                  }
                : { 'aria-hidden': true })}
            ref={ref}
            className={styles.gap}
            data-reorder-gap
            data-layout={context.layout}
            data-position={isAfter ? 'after' : 'before'}
            data-active={isActive || undefined}
        />
    );
}

export interface ReorderHandleProps {
    /** Defaults to "Move" and the label of the item. */
    label?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * The handle that drags an item of a `ReorderList`. The pointer drags it, and a long press on a
 * touch screen; with the keyboard, Enter or Space picks the item up. Put it in the header of the
 * item, with the other tools: the rest of the item doesn't drag, so its text stays selectable.
 */
export function ReorderHandle({ label, className, style }: ReorderHandleProps) {
    const context = useReorder();
    const item = useReorderItem();
    const intl = usePanneauIntl();
    const ref = useRef<HTMLDivElement>(null);
    // The browser's dragstart, when the pointer drags: its place, for the image
    const nativeStart = useRef<globalThis.DragEvent | null>(null);
    const isDisabled = context.isDisabled || context.count < 2;

    // The image that follows the pointer: a copy of the item, or of its part marked as preview
    const preview: RefObject<DragPreviewRenderer> = {
        current: (_items, callback) => {
            const node = ref.current?.closest<HTMLElement>('[data-reorder-item]');
            const host = context.list.current?.parentElement;
            if (node === null || node === undefined || host === null || host === undefined) {
                callback(null);
                return;
            }
            const source = node.querySelector<HTMLElement>('[data-reorder-preview]') ?? node;
            const rect = source.getBoundingClientRect();
            const copy = source.cloneNode(true) as HTMLElement;
            copy.removeAttribute('id');
            copy.setAttribute('aria-hidden', 'true');
            copy.inert = true;
            Object.assign(copy.style, {
                position: 'fixed',
                top: '0',
                left: '-100000px',
                width: `${rect.width}px`,
                pointerEvents: 'none',
            });
            host.append(copy);
            const start = nativeStart.current;
            callback(
                copy,
                start !== null ? start.clientX - rect.left : undefined,
                start !== null ? start.clientY - rect.top : undefined,
            );
            requestAnimationFrame(() => copy.remove());
        },
    };

    const { dragProps, isDragging } = useDrag({
        isDisabled,
        getItems: () => [
            { [context.type]: String(item.index), [REORDER_DRAG_TYPE]: String(item.id) },
        ],
        getAllowedDropOperations: () => ['move'],
        preview,
        onDragStart: () => {
            // A drag that starts from the browser's dragstart, unless a screen reader started it
            const native = nativeStart.current;
            context.start({
                index: item.index,
                id: item.id,
                mode: native !== null && !native.defaultPrevented ? 'pointer' : 'keyboard',
            });
        },
        onDragEnd: () => {
            nativeStart.current = null;
            context.end();
        },
    });

    return (
        <div
            {...dragProps}
            ref={ref}
            role="button"
            tabIndex={isDisabled ? undefined : 0}
            aria-label={
                label ??
                intl.formatMessage(messages.reorderHandle, { item: context.labelOf(item.index) })
            }
            aria-disabled={isDisabled || undefined}
            className={cx('panneau-reorder-handle', styles.handle, className)}
            style={style}
            data-reorder-handle
            data-dragging={isDragging || undefined}
            onDragStart={(event: DragEvent<HTMLDivElement>) => {
                nativeStart.current = event.nativeEvent;
                dragProps.onDragStart?.(event);
            }}
            onKeyDown={(event) => {
                // Space picks the item up, as Enter does: not a scroll of the page
                if (event.key === ' ' && !isDisabled) {
                    event.preventDefault();
                }
            }}
            onKeyUp={(event) => {
                if (event.key === ' ' && !isDisabled) {
                    event.preventDefault();
                    // React Aria starts a drag on Enter
                    event.currentTarget.dispatchEvent(
                        new globalThis.KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
                    );
                }
            }}
        >
            <Icon icon={GripVertical} size="sm" />
        </div>
    );
}

/** A move of an item without dragging it: where it goes, and its label in a menu. */
export interface ReorderMove {
    id: 'start' | 'before' | 'after' | 'end';
    /** The place the item goes to. */
    to: number;
    label: string;
}

/** The moves of the item of a `ReorderItem`, and what moves it. */
export interface ReorderMoves {
    /** To the start, before the item before it, after the item after it, to the end. */
    moves: readonly ReorderMove[];
    /** Moves the item, announced as a drop is. */
    move: (to: number) => void;
    /** The label of the item, from the list's `itemLabel`. */
    itemLabel: string;
}

/**
 * The moves of the item of the `ReorderItem` it is in, for a menu that has them with the other
 * actions of the item: one menu per item, rather than a `ReorderMenu` beside another menu. None
 * outside a `ReorderItem`, in a disabled list, or in a list of one item.
 */
export function useReorderMoves(): ReorderMoves {
    const context = use(ReorderContext);
    const item = use(ReorderItemContext);
    const intl = usePanneauIntl();
    if (context === null || item === null) {
        return { moves: [], move: () => undefined, itemLabel: '' };
    }
    const { index } = item;
    const { count } = context;
    const itemLabel = context.labelOf(index);
    const move = (to: number) => context.move(index, to);
    if (context.isDisabled || count < 2) {
        return { moves: [], move, itemLabel };
    }
    const moves: ReorderMove[] = [
        ...(index > 1
            ? [{ id: 'start' as const, to: 0, label: intl.formatMessage(messages.reorderToStart) }]
            : []),
        ...(index > 0
            ? [
                  {
                      id: 'before' as const,
                      to: index - 1,
                      label: intl.formatMessage(messages.reorderMoveBefore, {
                          item: context.labelOf(index - 1),
                      }),
                  },
              ]
            : []),
        ...(index < count - 1
            ? [
                  {
                      id: 'after' as const,
                      to: index + 1,
                      label: intl.formatMessage(messages.reorderMoveAfter, {
                          item: context.labelOf(index + 1),
                      }),
                  },
              ]
            : []),
        ...(index < count - 2
            ? [
                  {
                      id: 'end' as const,
                      to: count - 1,
                      label: intl.formatMessage(messages.reorderToEnd),
                  },
              ]
            : []),
    ];
    return { moves, move, itemLabel };
}

export interface ReorderMenuProps {
    /** Defaults to `sm`, as the other tools of an item. */
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * The buttons that move an item, without dragging it, in a menu: to the start, before the item
 * before it, after the item after it, or to the end. They are the path on phones, where a long press
 * isn't obvious. Put it with the tools of a `ReorderItem`: the move is announced as a drop is. A
 * list of one item, or a disabled list, has none. A menu with other actions of the item has its
 * moves with `useReorderMoves()` instead.
 */
export function ReorderMenu({ size = 'sm', className }: ReorderMenuProps) {
    useReorder();
    useReorderItem();
    const intl = usePanneauIntl();
    const { moves: actions, move, itemLabel } = useReorderMoves();
    if (actions.length === 0) {
        return null;
    }
    return (
        <MenuTrigger>
            <IconButton
                icon={ArrowUpDown}
                size={size}
                label={intl.formatMessage(messages.reorderMenu, { item: itemLabel })}
                className={cx('panneau-reorder-menu', className)}
            />
            <Menu
                placement="bottom end"
                onAction={(key) => {
                    const action = actions.find((candidate) => candidate.id === key);
                    if (action !== undefined) {
                        move(action.to);
                    }
                }}
            >
                {actions.map((action) => (
                    <MenuItem key={action.id} id={action.id}>
                        {action.label}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    );
}
