import {
    ArrowLeft,
    Crop,
    FlipHorizontal2,
    FlipVertical2,
    Focus,
    RotateCcw,
    RotateCw,
    Undo2,
} from 'lucide-react';
import { type KeyboardEvent, type PointerEvent, useEffect, useId, useRef, useState } from 'react';
import { Label, Radio, RadioGroup } from 'react-aria-components';

import {
    Alert,
    Badge,
    Button,
    Dialog,
    Disclosure,
    NumberInput,
    SegmentedControl,
    Text,
} from '@panneau/ui';

import type { TransformBase } from './ImageEditor';
import styles from './ImageEditorMockup.module.css';
import { ImagePreview, baseOf } from './ImagePreview';
import type { MockImage } from './fixtures';
import {
    type Point,
    type Rect,
    type Rotation,
    type Size,
    type Transform,
    cropAround,
    cropInView,
    focalInView,
    fromView,
    ratioLabel,
    rectFromView,
    svgTransform,
    viewSize,
} from './geometry';

export type ToolId = 'crop' | 'rotate' | 'focal';

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const CORNERS: readonly Handle[] = ['nw', 'ne', 'se', 'sw'];
const EDGES: readonly Handle[] = ['n', 'e', 's', 'w'];
const DEFAULT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16'];

const parseRatio = (id: string): number => {
    const [width = 1, height = 1] = id.split(':').map(Number);
    return width / height;
};

const center = (rect: Rect): Point => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
});

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const listOf = (ratios: readonly string[]) =>
    ratios.length > 1
        ? `${ratios.slice(0, -1).join(', ')} or ${ratios.at(-1) ?? ''}`
        : (ratios[0] ?? '');

/** Moves the edges of a crop that a handle holds, within the image, keeping a ratio if any. */
function resize(
    rect: Rect,
    handle: Handle,
    dx: number,
    dy: number,
    ratio: number | null,
    bounds: Size,
): Rect {
    const min = Math.min(bounds.width, bounds.height) * 0.05;
    const west = handle.includes('w');
    const north = handle.includes('n');
    if (ratio !== null) {
        const anchor = {
            x: west ? rect.x + rect.width : rect.x,
            y: north ? rect.y + rect.height : rect.y,
        };
        const roomX = west ? anchor.x : bounds.width - anchor.x;
        const roomY = north ? anchor.y : bounds.height - anchor.y;
        const width = clamp(
            west ? rect.width - dx : rect.width + dx,
            min,
            Math.min(roomX, roomY * ratio),
        );
        const height = width / ratio;
        return {
            x: west ? anchor.x - width : anchor.x,
            y: north ? anchor.y - height : anchor.y,
            width,
            height,
        };
    }
    let left = rect.x;
    let right = rect.x + rect.width;
    let top = rect.y;
    let bottom = rect.y + rect.height;
    if (west) {
        left = clamp(left + dx, 0, right - min);
    } else if (handle.includes('e')) {
        right = clamp(right + dx, left + min, bounds.width);
    }
    if (north) {
        top = clamp(top + dy, 0, bottom - min);
    } else if (handle.includes('s')) {
        bottom = clamp(bottom + dy, top + min, bounds.height);
    }
    return { x: left, y: top, width: right - left, height: bottom - top };
}

function move(rect: Rect, dx: number, dy: number, bounds: Size): Rect {
    return {
        ...rect,
        x: clamp(rect.x + dx, 0, bounds.width - rect.width),
        y: clamp(rect.y + dy, 0, bounds.height - rect.height),
    };
}

/** Where a handle sits on a crop. */
function handlePoint(rect: Rect, handle: Handle): Point {
    const x = handle.includes('w')
        ? rect.x
        : handle.includes('e')
          ? rect.x + rect.width
          : rect.x + rect.width / 2;
    const y = handle.includes('n')
        ? rect.y
        : handle.includes('s')
          ? rect.y + rect.height
          : rect.y + rect.height / 2;
    return { x, y };
}

const describeOwn = (own: Transform | undefined) => {
    const parts: string[] = [];
    if (own?.rotate !== undefined && own.rotate !== 0) {
        parts.push(`rotated ${String(own.rotate)}°`);
    }
    if (own?.crop !== undefined) {
        parts.push('cropped');
    }
    if (own?.flipX === true || own?.flipY === true) {
        parts.push('flipped');
    }
    return parts.join(', ');
};

export interface ImageEditorMockupProps {
    image: MockImage;
    /** The transform being edited, relative to `base`. */
    initial?: Transform;
    initialTool?: ToolId;
    base?: TransformBase;
    /** Shows "Start from: Library version / Original file". */
    canChooseBase?: boolean;
    /** The field's ratios. Without, the editor offers common ones. */
    ratios?: readonly string[];
    /** Whether a crop must have one of the field's ratios. */
    enforceRatios?: boolean;
    cropRequired?: boolean;
    /** Whether the field allows rotation and flips. */
    rotate?: boolean;
    focalPoint?: boolean;
    title?: string;
    applyLabel?: string;
    /** Shows "Back to the library": the editor is a step after the picker. */
    onBack?: () => void;
    /** The library's version of the image changed since this transform was made. */
    mediaChanged?: boolean;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onApply?: (transform: Transform, base: TransformBase) => void;
}

/**
 * A mockup of the image editor: the image as it will be rendered, with the crop frame or the focal
 * point over it, the tools on the side, and what is saved. Static data, no network.
 */
export function ImageEditorMockup({
    image,
    initial = {},
    initialTool = 'crop',
    base: initialBase = 'media',
    canChooseBase = false,
    ratios: fieldRatios,
    enforceRatios = false,
    cropRequired = false,
    rotate: canRotate = true,
    focalPoint: canFocus = true,
    title = 'Edit image',
    applyLabel = 'Apply',
    onBack,
    mediaChanged = false,
    isOpen = true,
    onOpenChange,
    onApply,
}: ImageEditorMockupProps) {
    const hintId = useId();
    const problemId = useId();
    const [base, setBase] = useState<TransformBase>(initialBase);
    // A required crop of fixed ratios starts as the largest crop of the first one, around the
    // focal point: the user adjusts it rather than making it.
    const proposed = cropRequired && initial.crop === undefined && enforceRatios;
    const [transform, setTransform] = useState<Transform>(() => {
        const first = fieldRatios?.[0];
        if (!proposed || first === undefined) {
            return initial;
        }
        const own = baseOf(image, initialBase).size;
        const rect = cropAround(
            { x: 0, y: 0, ...viewSize(own, initial.rotate) },
            parseRatio(first),
            focalInView(own, initial),
        );
        return { ...initial, crop: rectFromView(rect, own, initial) };
    });
    const [tool, setTool] = useState<ToolId>(initialTool);
    const { size } = baseOf(image, base);
    const view = viewSize(size, transform.rotate);
    const full: Rect = { x: 0, y: 0, ...view };
    const crop = cropInView(size, transform);
    const focal = focalInView(size, transform);

    const offered = enforceRatios
        ? (fieldRatios ?? [])
        : ['free', 'original', ...(fieldRatios ?? DEFAULT_RATIOS)];
    const ratioValue = (id: string, of: Size = view): number | null =>
        id === 'free' ? null : id === 'original' ? of.width / of.height : parseRatio(id);
    const matching = offered.find(
        (id) =>
            id !== 'free' &&
            transform.crop !== undefined &&
            Math.abs((ratioValue(id) ?? 0) - crop.width / crop.height) < 0.01,
    );
    const [ratio, setRatio] = useState<string>(
        matching ?? (enforceRatios ? (offered[0] ?? 'free') : 'free'),
    );
    const locked = ratioValue(ratio);

    // How many units of the view one screen pixel is, for handles of a constant size.
    const stage = useRef<SVGSVGElement>(null);
    const [unit, setUnit] = useState(view.width / 800);
    useEffect(() => {
        const svg = stage.current;
        if (svg === null) {
            return undefined;
        }
        const observer = new ResizeObserver(() => {
            const width = svg.getBoundingClientRect().width;
            const height = svg.getBoundingClientRect().height;
            if (width > 0 && height > 0) {
                setUnit(Math.max(view.width / width, view.height / height));
            }
        });
        observer.observe(svg);
        return () => observer.disconnect();
    }, [view.width, view.height]);

    const setCrop = (rect: Rect) =>
        setTransform((current) => ({ ...current, crop: rectFromView(rect, size, current) }));
    const setFocal = (point: Point) =>
        setTransform((current) => {
            const original = fromView(point, size, current);
            const round = (value: number) => Math.round(clamp(value, 0, 1) * 1000) / 1000;
            return {
                ...current,
                focalPoint: {
                    x: round(original.x / size.width),
                    y: round(original.y / size.height),
                },
            };
        });

    const chooseRatio = (id: string) => {
        setRatio(id);
        const value = ratioValue(id);
        if (value !== null) {
            setCrop(cropAround(full, value, center(crop)));
        }
    };

    const turn = (by: 90 | -90) =>
        setTransform((current) => {
            const rotate = (((current.rotate ?? 0) + by + 360) % 360) as Rotation;
            const next: Transform = { ...current, rotate };
            const value = ratioValue(ratio, viewSize(size, rotate));
            if (value === null || current.crop === undefined) {
                return next;
            }
            // A crop of a fixed ratio keeps its ratio once rotated.
            const turned = cropInView(size, next);
            const fitted = cropAround(
                { x: 0, y: 0, ...viewSize(size, rotate) },
                value,
                center(turned),
            );
            return { ...next, crop: rectFromView(fitted, size, next) };
        });

    // Dragging the crop, one of its handles, or the focal point.
    const drag = useRef<{ mode: Handle | 'move' | 'focal'; from: Point; rect: Rect } | null>(null);
    const pointOf = (event: PointerEvent): Point => {
        const matrix = stage.current?.getScreenCTM()?.inverse();
        const point = new DOMPoint(event.clientX, event.clientY);
        const found = matrix !== undefined ? point.matrixTransform(matrix) : point;
        return { x: found.x, y: found.y };
    };
    const startDrag = (mode: Handle | 'move' | 'focal', event: PointerEvent) => {
        event.stopPropagation();
        (event.currentTarget as Element).setPointerCapture(event.pointerId);
        drag.current = { mode, from: pointOf(event), rect: crop };
        if (mode === 'focal') {
            setFocal(pointOf(event));
        }
    };
    const onDrag = (event: PointerEvent) => {
        const current = drag.current;
        if (current === null) {
            return;
        }
        const point = pointOf(event);
        const dx = point.x - current.from.x;
        const dy = point.y - current.from.y;
        if (current.mode === 'focal') {
            setFocal({
                x: clamp(point.x, crop.x, crop.x + crop.width),
                y: clamp(point.y, crop.y, crop.y + crop.height),
            });
        } else if (current.mode === 'move') {
            setCrop(move(current.rect, dx, dy, view));
        } else {
            setCrop(resize(current.rect, current.mode, dx, dy, locked, view));
        }
    };
    const endDrag = () => {
        drag.current = null;
    };

    const step = Math.max(view.width, view.height) / 100;
    const arrows = (event: KeyboardEvent) => {
        const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
        const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
        return dx === 0 && dy === 0 ? null : { dx, dy };
    };
    const onCropKey = (event: KeyboardEvent) => {
        const delta = arrows(event);
        if (delta === null) {
            return;
        }
        event.preventDefault();
        if (event.shiftKey) {
            const grow = locked !== null ? delta.dx + delta.dy : delta.dx;
            setCrop(resize(crop, 'se', grow, delta.dy, locked, view));
        } else {
            setCrop(move(crop, delta.dx, delta.dy, view));
        }
    };
    const onFocalKey = (event: KeyboardEvent) => {
        const delta = arrows(event);
        if (delta !== null) {
            event.preventDefault();
            setFocal({
                x: clamp(focal.x + delta.dx, crop.x, crop.x + crop.width),
                y: clamp(focal.y + delta.dy, crop.y, crop.y + crop.height),
            });
        }
    };

    // What the field requires.
    const shownRatio = ratioLabel(crop.width, crop.height);
    const problem =
        cropRequired && transform.crop === undefined
            ? fieldRatios !== undefined && fieldRatios.length > 0
                ? `Crop the image to ${listOf(fieldRatios)} to apply.`
                : 'Crop the image to apply.'
            : enforceRatios &&
                transform.crop !== undefined &&
                !(fieldRatios ?? []).some(
                    (id) => Math.abs(parseRatio(id) - crop.width / crop.height) < 0.01,
                )
              ? `The crop must be ${listOf(fieldRatios ?? [])}.`
              : null;

    const own = image.mediaTransform;
    const handleSize = 14 * unit;
    const dim = `M0 0 H${String(view.width)} V${String(view.height)} H0 Z M${String(crop.x)} ${String(crop.y)} V${String(crop.y + crop.height)} H${String(crop.x + crop.width)} V${String(crop.y)} Z`;

    const tools = [
        { value: 'crop', label: 'Crop', icon: Crop },
        ...(canRotate ? [{ value: 'rotate', label: 'Rotate', icon: RotateCw }] : []),
        ...(canFocus ? [{ value: 'focal', label: 'Focal point', icon: Focus }] : []),
    ];
    const saved: Transform & { base?: TransformBase } = {
        ...transform,
        ...(own !== undefined ? { base } : {}),
    };

    return (
        <Dialog
            title={title}
            size="xl"
            fullScreenOnPhone
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className={styles.dialog}
            bodyClassName={styles.body}
            headerContent={
                canChooseBase && own !== undefined ? (
                    <div className={styles.baseChoice}>
                        <Text as="span" size="sm" muted id={`${hintId}-base`}>
                            Start from
                        </Text>
                        <SegmentedControl
                            aria-labelledby={`${hintId}-base`}
                            size="sm"
                            value={base}
                            onChange={(value) => {
                                setBase(value as TransformBase);
                                setTransform({});
                            }}
                            options={[
                                { value: 'media', label: 'Library version' },
                                { value: 'original', label: 'Original file' },
                            ]}
                        />
                    </div>
                ) : null
            }
            footer={(close) => (
                <div className={styles.footer}>
                    {onBack !== undefined ? (
                        <Button variant="ghost" icon={ArrowLeft} onPress={onBack}>
                            Back to the library
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        icon={Undo2}
                        className={styles.reset}
                        onPress={() => setTransform({})}
                    >
                        Reset
                    </Button>
                    <span className={styles.footerEnd}>
                        {problem !== null ? (
                            <Text as="span" size="sm" tone="danger" id={problemId}>
                                {problem}
                            </Text>
                        ) : null}
                        <Button onPress={close} className={styles.cancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            isDisabled={problem !== null}
                            aria-describedby={problem !== null ? problemId : undefined}
                            onPress={() => {
                                onApply?.(transform, base);
                                close();
                            }}
                        >
                            {applyLabel}
                        </Button>
                    </span>
                </div>
            )}
        >
            <div className={styles.layout}>
                <div className={styles.stageColumn}>
                    {mediaChanged ? (
                        <Alert tone="warning" title="The library's version of this image changed">
                            The crop for this use was made on the previous version. It was moved
                            inside the new one: check it before applying.
                        </Alert>
                    ) : null}
                    <div className={styles.stage}>
                        <svg
                            ref={stage}
                            className={styles.canvas}
                            viewBox={`0 0 ${String(view.width)} ${String(view.height)}`}
                            role="group"
                            aria-label={`${image.label}, as it will be rendered`}
                            onPointerMove={onDrag}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                            onPointerDown={
                                tool === 'focal' ? (event) => startDrag('focal', event) : undefined
                            }
                        >
                            <g transform={svgTransform(size, transform)}>
                                {baseOf(image, base).content}
                            </g>
                            <path d={dim} className={styles.dim} fillRule="evenodd" />
                            {tool === 'crop' ? (
                                <g
                                    tabIndex={0}
                                    role="group"
                                    aria-roledescription="crop frame"
                                    aria-label={`Crop, ${String(Math.round(crop.width))} by ${String(Math.round(crop.height))} pixels`}
                                    aria-describedby={hintId}
                                    className={styles.frame}
                                    onKeyDown={onCropKey}
                                >
                                    <rect
                                        x={crop.x}
                                        y={crop.y}
                                        width={crop.width}
                                        height={crop.height}
                                        className={styles.frameArea}
                                        onPointerDown={(event) => startDrag('move', event)}
                                    />
                                    {[1, 2].map((third) => (
                                        <g key={third} className={styles.thirds}>
                                            <line
                                                x1={crop.x + (crop.width * third) / 3}
                                                x2={crop.x + (crop.width * third) / 3}
                                                y1={crop.y}
                                                y2={crop.y + crop.height}
                                            />
                                            <line
                                                y1={crop.y + (crop.height * third) / 3}
                                                y2={crop.y + (crop.height * third) / 3}
                                                x1={crop.x}
                                                x2={crop.x + crop.width}
                                            />
                                        </g>
                                    ))}
                                    <rect
                                        x={crop.x}
                                        y={crop.y}
                                        width={crop.width}
                                        height={crop.height}
                                        className={styles.frameBorder}
                                    />
                                    {[...CORNERS, ...(locked === null ? EDGES : [])].map(
                                        (handle) => {
                                            const at = handlePoint(crop, handle);
                                            return (
                                                <rect
                                                    key={handle}
                                                    x={at.x - handleSize / 2}
                                                    y={at.y - handleSize / 2}
                                                    width={handleSize}
                                                    height={handleSize}
                                                    rx={handleSize / 4}
                                                    className={styles.handle}
                                                    data-handle={handle}
                                                    onPointerDown={(event) =>
                                                        startDrag(handle, event)
                                                    }
                                                />
                                            );
                                        },
                                    )}
                                </g>
                            ) : (
                                <rect
                                    x={crop.x}
                                    y={crop.y}
                                    width={crop.width}
                                    height={crop.height}
                                    className={styles.frameBorder}
                                />
                            )}
                            {tool === 'focal' ? (
                                <g
                                    tabIndex={0}
                                    role="group"
                                    aria-roledescription="focal point"
                                    aria-label={`Focal point, ${String(Math.round((transform.focalPoint?.x ?? 0.5) * 100))}% from the left, ${String(Math.round((transform.focalPoint?.y ?? 0.5) * 100))}% from the top`}
                                    aria-describedby={hintId}
                                    className={styles.focal}
                                    onKeyDown={onFocalKey}
                                >
                                    <circle
                                        cx={focal.x}
                                        cy={focal.y}
                                        r={18 * unit}
                                        className={styles.focalRing}
                                    />
                                    <circle
                                        cx={focal.x}
                                        cy={focal.y}
                                        r={4 * unit}
                                        className={styles.focalDot}
                                    />
                                </g>
                            ) : null}
                        </svg>
                    </div>
                    <Text size="sm" muted id={hintId} className={styles.hint}>
                        {tool === 'crop'
                            ? 'Drag the frame or its corners. Keyboard: arrow keys move it, Shift + arrow keys resize it.'
                            : tool === 'focal'
                              ? 'Click or drag where the subject is. Keyboard: arrow keys move the point.'
                              : 'The image is shown as it will be rendered.'}
                    </Text>
                </div>

                <div className={styles.side}>
                    <SegmentedControl
                        aria-label="Tool"
                        fullWidth
                        value={tool}
                        onChange={(value) => setTool(value as ToolId)}
                        options={tools}
                    />

                    {own !== undefined ? (
                        <Alert tone="info" className={styles.baseNote}>
                            {base === 'media' ? (
                                <>
                                    Starts from the library&apos;s version ({describeOwn(own)}).
                                    This edit applies over it.
                                </>
                            ) : (
                                <>
                                    Starts from the original file: the library&apos;s edits (
                                    {describeOwn(own)}) don&apos;t apply.
                                </>
                            )}
                        </Alert>
                    ) : null}

                    {tool === 'crop' ? (
                        <div className={styles.panel}>
                            <RadioGroup
                                className={styles.ratioGroup}
                                value={ratio}
                                onChange={chooseRatio}
                            >
                                <Label className={styles.panelLabel}>
                                    Aspect ratio
                                    {enforceRatios ? (
                                        <Badge tone="neutral">Required by the field</Badge>
                                    ) : null}
                                </Label>
                                <div className={styles.ratios}>
                                    {offered.map((id) => {
                                        const value = ratioValue(id);
                                        const shape =
                                            value === null
                                                ? { width: 22, height: 16 }
                                                : value >= 1
                                                  ? { width: 24, height: 24 / value }
                                                  : { width: 24 * value, height: 24 };
                                        return (
                                            <Radio key={id} value={id} className={styles.ratio}>
                                                <span
                                                    aria-hidden
                                                    className={
                                                        value === null
                                                            ? styles.ratioFree
                                                            : styles.ratioShape
                                                    }
                                                    style={shape}
                                                />
                                                {id === 'free'
                                                    ? 'Free'
                                                    : id === 'original'
                                                      ? 'Original'
                                                      : id}
                                            </Radio>
                                        );
                                    })}
                                </div>
                            </RadioGroup>
                            <div className={styles.numbers}>
                                {(
                                    [
                                        ['x', 'X'],
                                        ['y', 'Y'],
                                        ['width', 'Width'],
                                        ['height', 'Height'],
                                    ] as const
                                ).map(([key, label]) => (
                                    <NumberInput
                                        key={key}
                                        label={label}
                                        suffix="px"
                                        minValue={0}
                                        value={Math.round(crop[key])}
                                        isDisabled={locked !== null && key === 'height'}
                                        onChange={(value) => {
                                            if (value === null) {
                                                return;
                                            }
                                            const next = { ...crop, [key]: value };
                                            if (locked !== null && key === 'width') {
                                                next.height = value / locked;
                                            }
                                            setCrop({
                                                ...next,
                                                width: clamp(next.width, 1, view.width - next.x),
                                                height: clamp(next.height, 1, view.height - next.y),
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                            {proposed ? (
                                <Text size="sm">
                                    The field requires a crop: this one is proposed around the focal
                                    point. Adjust it, or choose another ratio.
                                </Text>
                            ) : null}
                            <Text size="sm" muted>
                                In pixels of the image as rendered: {String(Math.round(view.width))}{' '}
                                × {String(Math.round(view.height))}.
                            </Text>
                        </div>
                    ) : null}

                    {tool === 'rotate' ? (
                        <div className={styles.panel}>
                            <div className={styles.buttons}>
                                <Button icon={RotateCcw} onPress={() => turn(-90)}>
                                    Rotate left
                                </Button>
                                <Button icon={RotateCw} onPress={() => turn(90)}>
                                    Rotate right
                                </Button>
                                <Button
                                    icon={FlipHorizontal2}
                                    aria-pressed={transform.flipX === true}
                                    onPress={() =>
                                        setTransform((current) => ({
                                            ...current,
                                            flipX: current.flipX !== true,
                                        }))
                                    }
                                >
                                    Flip horizontally
                                </Button>
                                <Button
                                    icon={FlipVertical2}
                                    aria-pressed={transform.flipY === true}
                                    onPress={() =>
                                        setTransform((current) => ({
                                            ...current,
                                            flipY: current.flipY !== true,
                                        }))
                                    }
                                >
                                    Flip vertically
                                </Button>
                            </div>
                            <Text size="sm" muted>
                                {`Rotated ${String(transform.rotate ?? 0)}°`}
                                {transform.flipX === true ? ', flipped horizontally' : ''}
                                {transform.flipY === true ? ', flipped vertically' : ''}. The crop
                                {locked !== null ? ` keeps its ${ratio} ratio and` : ''} follows the
                                image.
                            </Text>
                        </div>
                    ) : null}

                    {tool === 'focal' ? (
                        <div className={styles.panel}>
                            <Text size="sm">
                                Automatic crops keep this point in view, for the sizes a site asks
                                for:
                            </Text>
                            <div className={styles.focalPreviews}>
                                {(['1:1', '4:5', '16:9'] as const).map((id) => (
                                    <figure key={id} className={styles.focalPreview}>
                                        <ImagePreview
                                            image={image}
                                            base={base}
                                            transform={transform}
                                            region={cropAround(crop, parseRatio(id), focal)}
                                            label={`Automatic ${id} crop`}
                                            className={styles.focalPreviewImage}
                                        />
                                        <figcaption>{id}</figcaption>
                                    </figure>
                                ))}
                            </div>
                            <div className={styles.numbers}>
                                <NumberInput
                                    label="From the left"
                                    suffix="%"
                                    minValue={0}
                                    maxValue={100}
                                    value={Math.round((transform.focalPoint?.x ?? 0.5) * 100)}
                                    onChange={(value) =>
                                        value !== null &&
                                        setTransform((current) => ({
                                            ...current,
                                            focalPoint: {
                                                x: value / 100,
                                                y: current.focalPoint?.y ?? 0.5,
                                            },
                                        }))
                                    }
                                />
                                <NumberInput
                                    label="From the top"
                                    suffix="%"
                                    minValue={0}
                                    maxValue={100}
                                    value={Math.round((transform.focalPoint?.y ?? 0.5) * 100)}
                                    onChange={(value) =>
                                        value !== null &&
                                        setTransform((current) => ({
                                            ...current,
                                            focalPoint: {
                                                x: current.focalPoint?.x ?? 0.5,
                                                y: value / 100,
                                            },
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className={styles.result}>
                        <ImagePreview
                            image={image}
                            base={base}
                            transform={transform}
                            label={`Result: ${image.label}`}
                            className={styles.resultImage}
                        />
                        <div className={styles.resultText}>
                            <Text size="sm" weight="medium">
                                Result
                            </Text>
                            <Text size="sm" muted numeric>
                                {String(Math.round(crop.width))} × {String(Math.round(crop.height))}{' '}
                                · {shownRatio}
                            </Text>
                        </div>
                    </div>
                    <Disclosure title="What is saved" className={styles.saved}>
                        <pre className={styles.json}>{JSON.stringify(saved, null, 2)}</pre>
                    </Disclosure>
                </div>
            </div>
        </Dialog>
    );
}
