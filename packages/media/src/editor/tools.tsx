import { Crop, FlipHorizontal2, FlipVertical2, Focus, RotateCcw, RotateCw } from 'lucide-react';
import { type KeyboardEvent, type PointerEvent, useRef } from 'react';
import { Label, Radio, RadioGroup } from 'react-aria-components';

import { mediaMessages as messages } from '@panneau/intl';
import type { MediaTransform } from '@panneau/protocol';
import { matchesRatio, parseRatio } from '@panneau/protocol/runtime';
import { Badge, Button, NumberInput, Text, usePanneauIntl } from '@panneau/ui';

import styles from './ImageEditor.module.css';
import {
    type Handle,
    type Point,
    type Rect,
    type Rotation,
    cropAround,
    cropInView,
    focalFromView,
    focalInView,
    handlePoint,
    moveRect,
    rectFromView,
    resizeRect,
    viewSize,
} from './geometry';
import type { ImageEditorTool, ImageEditorToolContext } from './types';

/** The ratios offered when the field gives none. */
const COMMON_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16'];
const CORNERS: readonly Handle[] = ['nw', 'ne', 'se', 'sw'];
const EDGES: readonly Handle[] = ['n', 'e', 's', 'w'];
/** The ratios of the automatic crops the focal point shows. */
const PREVIEW_RATIOS = ['1:1', '4:5', '16:9'] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const center = (rect: Rect): Point => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

/** The ratios the crop tool offers, the one chosen, and the ratio the frame keeps. */
function cropRatios(context: ImageEditorToolContext) {
    const { ratios, enforceRatios, transform, crop, view } = context;
    const offered = enforceRatios
        ? [...ratios]
        : ['free', 'original', ...(ratios.length > 0 ? ratios : COMMON_RATIOS)];
    const valueOf = (id: string): number | null =>
        id === 'free' ? null : id === 'original' ? view.width / view.height : parseRatio(id);
    const chosen = (context.state as { ratio?: string } | undefined)?.ratio;
    const matching =
        transform.crop !== undefined
            ? offered.find((id) => {
                  const value = valueOf(id);
                  return value !== null && matchesRatio(crop.width, crop.height, value);
              })
            : undefined;
    const selected =
        chosen !== undefined && offered.includes(chosen)
            ? chosen
            : (matching ?? (enforceRatios ? (offered[0] ?? 'free') : 'free'));
    return { offered, selected, locked: valueOf(selected), valueOf };
}

function setCropInView(context: ImageEditorToolContext, rect: Rect) {
    const { size } = context;
    context.setTransform((current) => ({ ...current, crop: rectFromView(rect, size, current) }));
}

function arrows(event: KeyboardEvent, step: number) {
    const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
    const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
    return dx === 0 && dy === 0 ? null : { dx, dy };
}

/** The ratios, as tiles of their shape, and the crop in numbers. */
function CropPanel(context: ImageEditorToolContext) {
    const intl = usePanneauIntl();
    const { crop, view, enforceRatios } = context;
    const { offered, selected, locked, valueOf } = cropRatios(context);
    const label = (id: string) =>
        id === 'free'
            ? intl.formatMessage(messages.editorRatioFree)
            : id === 'original'
              ? intl.formatMessage(messages.editorRatioOriginal)
              : id;
    return (
        <div className={styles.panel}>
            <RadioGroup
                value={selected}
                onChange={(id) => {
                    context.setState({ ratio: id });
                    const value = valueOf(id);
                    if (value !== null) {
                        setCropInView(
                            context,
                            cropAround({ x: 0, y: 0, ...view }, value, center(crop)),
                        );
                    }
                }}
            >
                <Label className={styles.panelLabel}>
                    {intl.formatMessage(messages.editorRatio)}
                    {enforceRatios ? (
                        <Badge>{intl.formatMessage(messages.editorRatioRequired)}</Badge>
                    ) : null}
                </Label>
                <div className={styles.ratios}>
                    {offered.map((id) => {
                        const value = valueOf(id);
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
                                        value === null ? styles.ratioFree : styles.ratioShape
                                    }
                                    style={shape}
                                />
                                {label(id)}
                            </Radio>
                        );
                    })}
                </div>
            </RadioGroup>
            <div className={styles.numbers}>
                {(
                    [
                        ['x', messages.editorCropX],
                        ['y', messages.editorCropY],
                        ['width', messages.editorCropWidth],
                        ['height', messages.editorCropHeight],
                    ] as const
                ).map(([key, message]) => (
                    <NumberInput
                        key={key}
                        label={intl.formatMessage(message)}
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
                            const x = clamp(next.x, 0, view.width - 1);
                            const y = clamp(next.y, 0, view.height - 1);
                            setCropInView(context, {
                                x,
                                y,
                                width: clamp(next.width, 1, view.width - x),
                                height: clamp(next.height, 1, view.height - y),
                            });
                        }}
                    />
                ))}
            </div>
            <Text size="sm" muted>
                {intl.formatMessage(messages.editorCropPixels, {
                    width: Math.round(view.width),
                    height: Math.round(view.height),
                })}
            </Text>
        </div>
    );
}

/** The crop frame: moved by dragging it, resized by its handles, or with the keyboard. */
function CropOverlay(context: ImageEditorToolContext) {
    const intl = usePanneauIntl();
    const { crop, view, unit } = context;
    const { locked } = cropRatios(context);
    const drag = useRef<{ handle: Handle | 'move'; from: Point; rect: Rect } | null>(null);
    const start = (handle: Handle | 'move', event: PointerEvent) => {
        event.stopPropagation();
        (event.currentTarget as Element).setPointerCapture(event.pointerId);
        drag.current = { handle, from: context.pointToView(event), rect: crop };
    };
    const move = (event: PointerEvent) => {
        const current = drag.current;
        if (current === null) {
            return;
        }
        const point = context.pointToView(event);
        const dx = point.x - current.from.x;
        const dy = point.y - current.from.y;
        setCropInView(
            context,
            current.handle === 'move'
                ? moveRect(current.rect, dx, dy, view)
                : resizeRect(current.rect, current.handle, dx, dy, locked, view),
        );
    };
    const end = () => {
        drag.current = null;
    };
    const step = Math.max(view.width, view.height) / 100;
    const handleSize = 14 * unit;
    return (
        <g
            tabIndex={0}
            role="group"
            aria-roledescription={intl.formatMessage(messages.editorCropFrameRole)}
            aria-label={intl.formatMessage(messages.editorCropFrame, {
                width: Math.round(crop.width),
                height: Math.round(crop.height),
            })}
            aria-describedby={context.hintId}
            className={styles.frame}
            onKeyDown={(event) => {
                const delta = arrows(event, step);
                if (delta === null) {
                    return;
                }
                event.preventDefault();
                setCropInView(
                    context,
                    event.shiftKey
                        ? resizeRect(
                              crop,
                              'se',
                              locked !== null ? delta.dx + delta.dy : delta.dx,
                              delta.dy,
                              locked,
                              view,
                          )
                        : moveRect(crop, delta.dx, delta.dy, view),
                );
            }}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
        >
            <rect
                x={crop.x}
                y={crop.y}
                width={crop.width}
                height={crop.height}
                className={styles.frameArea}
                onPointerDown={(event) => start('move', event)}
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
            {[...CORNERS, ...(locked === null ? EDGES : [])].map((handle) => {
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
                        onPointerDown={(event) => start(handle, event)}
                    />
                );
            })}
        </g>
    );
}

/** Turns the image a quarter. A crop of the field's ratios keeps its ratio. */
function turn(context: ImageEditorToolContext, by: 90 | -90) {
    const { size, ratios, crop } = context;
    const kept = ratios
        .map((ratio) => parseRatio(ratio))
        .find((value) => value !== null && matchesRatio(crop.width, crop.height, value));
    context.setTransform((current) => {
        const rotate = (((current.rotate ?? 0) + by + 360) % 360) as Rotation;
        const next: MediaTransform = { ...current, rotate };
        if (kept === undefined || kept === null || current.crop === undefined) {
            return next;
        }
        const turned = viewSize(size, rotate);
        const fitted = cropAround({ x: 0, y: 0, ...turned }, kept, center(cropInView(size, next)));
        return { ...next, crop: rectFromView(fitted, size, next) };
    });
}

function RotatePanel(context: ImageEditorToolContext) {
    const intl = usePanneauIntl();
    const { transform, ratios, crop } = context;
    const flip = (key: 'flipX' | 'flipY') =>
        context.setTransform((current) => ({ ...current, [key]: current[key] !== true }));
    const kept = ratios.find((ratio) => matchesRatio(crop.width, crop.height, ratio));
    return (
        <div className={styles.panel}>
            <div className={styles.buttons}>
                <Button icon={RotateCcw} onPress={() => turn(context, -90)}>
                    {intl.formatMessage(messages.editorRotateLeft)}
                </Button>
                <Button icon={RotateCw} onPress={() => turn(context, 90)}>
                    {intl.formatMessage(messages.editorRotateRight)}
                </Button>
                <Button
                    icon={FlipHorizontal2}
                    aria-pressed={transform.flipX === true}
                    onPress={() => flip('flipX')}
                >
                    {intl.formatMessage(messages.editorFlipHorizontal)}
                </Button>
                <Button
                    icon={FlipVertical2}
                    aria-pressed={transform.flipY === true}
                    onPress={() => flip('flipY')}
                >
                    {intl.formatMessage(messages.editorFlipVertical)}
                </Button>
            </div>
            <Text size="sm" muted>
                {intl.formatMessage(messages.editorRotated, { degrees: transform.rotate ?? 0 })}
                {kept !== undefined && transform.crop !== undefined
                    ? ` ${intl.formatMessage(messages.editorRotateKeepsRatio, { ratio: kept })}`
                    : null}
            </Text>
        </div>
    );
}

function setFocal(context: ImageEditorToolContext, point: Point) {
    const { size, crop } = context;
    const inside = {
        x: clamp(point.x, crop.x, crop.x + crop.width),
        y: clamp(point.y, crop.y, crop.y + crop.height),
    };
    context.setTransform((current) => ({
        ...current,
        focalPoint: focalFromView(inside, size, current),
    }));
}

/** The automatic crops the focal point gives, and the point in numbers. */
function FocalPanel(context: ImageEditorToolContext) {
    const intl = usePanneauIntl();
    const { transform, size, crop } = context;
    const focal = focalInView(size, transform);
    const percent = (value: number | undefined) => Math.round((value ?? 0.5) * 100);
    const setPercent = (key: 'x' | 'y', value: number | null) => {
        if (value === null) {
            return;
        }
        context.setTransform((current) => ({
            ...current,
            focalPoint: {
                x: current.focalPoint?.x ?? 0.5,
                y: current.focalPoint?.y ?? 0.5,
                [key]: clamp(value, 0, 100) / 100,
            },
        }));
    };
    return (
        <div className={styles.panel}>
            <Text size="sm">{intl.formatMessage(messages.editorFocalIntro)}</Text>
            <div className={styles.focalPreviews}>
                {PREVIEW_RATIOS.map((id) => {
                    const region = cropAround(crop, parseRatio(id) ?? 1, focal);
                    return (
                        <figure key={id} className={styles.focalPreview}>
                            <svg
                                role="img"
                                aria-label={intl.formatMessage(messages.editorFocalPreview, {
                                    ratio: id,
                                })}
                                viewBox={`${String(region.x)} ${String(region.y)} ${String(region.width)} ${String(region.height)}`}
                                className={styles.focalPreviewImage}
                            >
                                {context.drawing}
                            </svg>
                            <figcaption>{id}</figcaption>
                        </figure>
                    );
                })}
            </div>
            <div className={styles.numbers}>
                <NumberInput
                    label={intl.formatMessage(messages.editorFocalLeft)}
                    suffix="%"
                    minValue={0}
                    maxValue={100}
                    value={percent(transform.focalPoint?.x)}
                    onChange={(value) => setPercent('x', value)}
                />
                <NumberInput
                    label={intl.formatMessage(messages.editorFocalTop)}
                    suffix="%"
                    minValue={0}
                    maxValue={100}
                    value={percent(transform.focalPoint?.y)}
                    onChange={(value) => setPercent('y', value)}
                />
            </div>
        </div>
    );
}

/** The focal point: set by a click or a drag on the image, or with the keyboard. */
function FocalOverlay(context: ImageEditorToolContext) {
    const intl = usePanneauIntl();
    const { transform, size, view, unit } = context;
    const focal = focalInView(size, transform);
    const dragging = useRef(false);
    const step = Math.max(view.width, view.height) / 100;
    return (
        <g
            onPointerDown={(event) => {
                (event.currentTarget as Element).setPointerCapture(event.pointerId);
                dragging.current = true;
                setFocal(context, context.pointToView(event));
            }}
            onPointerMove={(event) => {
                if (dragging.current) {
                    setFocal(context, context.pointToView(event));
                }
            }}
            onPointerUp={() => {
                dragging.current = false;
            }}
            onPointerCancel={() => {
                dragging.current = false;
            }}
        >
            <rect width={view.width} height={view.height} className={styles.focalArea} />
            <g
                tabIndex={0}
                role="group"
                aria-roledescription={intl.formatMessage(messages.editorFocalRole)}
                aria-label={intl.formatMessage(messages.editorFocalPoint, {
                    x: Math.round((transform.focalPoint?.x ?? 0.5) * 100),
                    y: Math.round((transform.focalPoint?.y ?? 0.5) * 100),
                })}
                aria-describedby={context.hintId}
                className={styles.focal}
                onKeyDown={(event) => {
                    const delta = arrows(event, step);
                    if (delta !== null) {
                        event.preventDefault();
                        setFocal(context, { x: focal.x + delta.dx, y: focal.y + delta.dy });
                    }
                }}
            >
                <circle cx={focal.x} cy={focal.y} r={18 * unit} className={styles.focalRing} />
                <circle cx={focal.x} cy={focal.y} r={4 * unit} className={styles.focalDot} />
            </g>
        </g>
    );
}

/**
 * The tools of the editor by default: crop, rotate (with flips) and focal point. A product passes
 * them to `ImageEditor`'s `tools` with its own, or without the ones a field doesn't offer.
 */
export function useImageEditorTools(): {
    crop: ImageEditorTool;
    rotate: ImageEditorTool;
    focalPoint: ImageEditorTool;
} {
    const intl = usePanneauIntl();
    return {
        crop: {
            id: 'crop',
            label: intl.formatMessage(messages.editorToolCrop),
            icon: Crop,
            hint: intl.formatMessage(messages.editorCropHint),
            renderPanel: (context) => <CropPanel {...context} />,
            renderOverlay: (context) => <CropOverlay {...context} />,
        },
        rotate: {
            id: 'rotate',
            label: intl.formatMessage(messages.editorToolRotate),
            icon: RotateCw,
            hint: intl.formatMessage(messages.editorRotateHint),
            renderPanel: (context) => <RotatePanel {...context} />,
        },
        focalPoint: {
            id: 'focalPoint',
            label: intl.formatMessage(messages.editorToolFocalPoint),
            icon: Focus,
            hint: intl.formatMessage(messages.editorFocalHint),
            renderPanel: (context) => <FocalPanel {...context} />,
            renderOverlay: (context) => <FocalOverlay {...context} />,
        },
    };
}
