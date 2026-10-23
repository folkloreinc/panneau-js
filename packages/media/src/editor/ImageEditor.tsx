import { ArrowLeft, Undo2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { mediaMessages as messages } from '@panneau/intl';
import type { MediaTransform } from '@panneau/protocol';
import { matchesRatio, parseRatio } from '@panneau/protocol/runtime';
import { Alert, Button, Dialog, SegmentedControl, Text, usePanneauIntl } from '@panneau/ui';

import styles from './ImageEditor.module.css';
import { drawBase, ownTransform, ratioLabel, viewBox } from './draw';
import {
    type Size,
    clampCrop,
    cropAround,
    cropInView,
    focalInView,
    rectFromView,
    sameEdits,
    svgTransform,
    viewSize,
} from './geometry';
import { useImageEditorTools } from './tools';
import type { ImageEditorProps, ImageEditorToolContext, TransformBase } from './types';

/** The edits of a transform, without what doesn't change the image. */
function cleanEdits(transform: MediaTransform): MediaTransform {
    const { rotate, flipX, flipY, ...rest } = transform;
    return {
        ...rest,
        ...(rotate !== undefined && rotate !== 0 ? { rotate } : {}),
        ...(flipX === true ? { flipX } : {}),
        ...(flipY === true ? { flipY } : {}),
    };
}

/**
 * The image editor (decision 0031): the image as it will be rendered, with the overlay of a tool
 * over it, the tool's options on the side, and the result. It edits a transform for one use, over
 * the media's own transform or from the original file, and returns it in the protocol's shape.
 */
export function ImageEditor(props: ImageEditorProps) {
    // A new editor each time it opens: its edits start from the value again.
    if (!props.isOpen) {
        return null;
    }
    return <OpenImageEditor {...props} />;
}

function OpenImageEditor({
    onOpenChange,
    image,
    value,
    base: newBase,
    canChooseBase = false,
    tools: givenTools,
    ratios = [],
    enforceRatios = false,
    cropRequired = false,
    title,
    applyLabel,
    onBack,
    onApply,
}: ImageEditorProps) {
    const intl = usePanneauIntl();
    const hintId = useId();
    const problemId = useId();
    const baseLabelId = useId();
    const defaults = useImageEditorTools();
    const tools = givenTools ?? [defaults.crop, defaults.rotate, defaults.focalPoint];

    const own = ownTransform(image);
    const sizeOf = (base: TransformBase): Size => drawBase(image, base).size;

    // Where the edits start: the value's, moved inside the media's version when it changed, or
    // a crop the field requires, proposed around the focal point.
    const [start] = useState(() => {
        const base: TransformBase =
            value !== null
                ? value.base === 'media'
                    ? 'media'
                    : 'original'
                : own !== null
                  ? (newBase ?? 'media')
                  : 'original';
        const { base: _base, baseTransform, ...rest } = value ?? {};
        const size = sizeOf(base);
        let edits: MediaTransform = rest;
        if (edits.crop !== undefined) {
            const { crop: _crop, ...withoutCrop } = edits;
            const clamped = clampCrop(edits.crop, size);
            edits = clamped !== null ? { ...withoutCrop, crop: clamped } : withoutCrop;
        }
        const first = parseRatio(ratios[0] ?? '');
        if (cropRequired && enforceRatios && first !== null && edits.crop === undefined) {
            const view = viewSize(size, edits.rotate);
            const proposed = cropAround({ x: 0, y: 0, ...view }, first, focalInView(size, edits));
            edits = { ...edits, crop: rectFromView(proposed, size, edits) };
        }
        return {
            base,
            edits,
            proposed: edits.crop !== undefined && value?.crop === undefined,
            changed:
                base === 'media' &&
                baseTransform !== undefined &&
                !sameEdits(baseTransform, own ?? {}),
        };
    });
    const [base, setBase] = useState<TransformBase>(start.base);
    const [transform, setTransform] = useState<MediaTransform>(start.edits);
    const [toolId, setToolId] = useState(tools[0]?.id ?? '');
    const [toolStates, setToolStates] = useState<Record<string, unknown>>({});

    const size = sizeOf(base);
    const view = viewSize(size, transform.rotate);
    const crop = cropInView(size, transform);
    const tool = tools.find((candidate) => candidate.id === toolId) ?? tools[0];

    // The image the edits apply to: the original, or the media's version drawn in a viewport.
    const drawing = (
        <g transform={svgTransform(size, transform)}>{drawBase(image, base).drawing}</g>
    );

    // How many units of the view one pixel of the screen is, for marks of a constant size.
    // The stage is kept in state, not in a ref, since the tools read it through `pointToView`.
    const [stage, setStage] = useState<SVGSVGElement | null>(null);
    const [unit, setUnit] = useState(Math.max(view.width, view.height) / 800);
    useEffect(() => {
        const svg = stage;
        // Without ResizeObserver (jsdom), marks keep the size of a stage 800 pixels wide.
        if (svg === null || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(() => {
            const { width, height } = svg.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setUnit(Math.max(view.width / width, view.height / height));
            }
        });
        observer.observe(svg);
        return () => observer.disconnect();
    }, [stage, view.width, view.height]);

    const context: ImageEditorToolContext = {
        image,
        transform,
        setTransform: (update) => setTransform((current) => update(current)),
        size,
        view,
        crop,
        unit,
        drawing,
        pointToView: (event) => {
            const matrix = stage?.getScreenCTM()?.inverse();
            const point = new DOMPoint(event.clientX, event.clientY);
            const found = matrix !== undefined ? point.matrixTransform(matrix) : point;
            return { x: found.x, y: found.y };
        },
        ratios,
        enforceRatios,
        state: toolStates[toolId],
        setState: (state) => setToolStates((current) => ({ ...current, [toolId]: state })),
        hintId,
    };

    // What the field requires, then what the tools say.
    const ratioList = intl.formatList(ratios, { type: 'disjunction' });
    let problem: string | null = null;
    if (cropRequired && transform.crop === undefined) {
        problem =
            ratios.length > 0
                ? intl.formatMessage(messages.editorCropRequiredRatios, { ratios: ratioList })
                : intl.formatMessage(messages.editorCropRequired);
    } else if (
        enforceRatios &&
        ratios.length > 0 &&
        transform.crop !== undefined &&
        !ratios.some((ratio) => matchesRatio(crop.width, crop.height, ratio))
    ) {
        problem = intl.formatMessage(messages.editorCropRatios, { ratios: ratioList });
    }
    for (const candidate of tools) {
        problem ??= candidate.validate?.(transform) ?? null;
    }

    /** The transform the value keeps: the edits, with their base over the media's version. */
    const result = (): MediaTransform | null => {
        const edits = cleanEdits(transform);
        if (Object.keys(edits).length === 0) {
            return null;
        }
        return base === 'media' && own !== null
            ? { base: 'media', baseTransform: own, ...edits }
            : edits;
    };

    return (
        <Dialog
            title={title ?? intl.formatMessage(messages.editorTitle)}
            size="xl"
            fullScreenOnPhone
            isOpen
            onOpenChange={onOpenChange}
            className={styles.dialog}
            bodyClassName={styles.body}
            headerContent={
                canChooseBase && own !== null ? (
                    <div className={styles.baseChoice}>
                        <Text as="span" size="sm" muted id={baseLabelId}>
                            {intl.formatMessage(messages.editorStartFrom)}
                        </Text>
                        <SegmentedControl
                            aria-labelledby={baseLabelId}
                            size="sm"
                            value={base}
                            onChange={(next) => {
                                // The edits are in the pixels of their base: they start over.
                                setBase(next as TransformBase);
                                setTransform({});
                            }}
                            options={[
                                {
                                    value: 'media',
                                    label: intl.formatMessage(messages.editorBaseMedia),
                                },
                                {
                                    value: 'original',
                                    label: intl.formatMessage(messages.editorBaseOriginal),
                                },
                            ]}
                        />
                    </div>
                ) : null
            }
            footer={(close) => (
                <div className={styles.footer}>
                    {onBack !== undefined ? (
                        <Button variant="ghost" icon={ArrowLeft} onPress={onBack}>
                            {intl.formatMessage(messages.editorBack)}
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        icon={Undo2}
                        className={styles.reset}
                        onPress={() => setTransform({})}
                    >
                        {intl.formatMessage(messages.editorReset)}
                    </Button>
                    <span className={styles.footerEnd}>
                        {problem !== null ? (
                            <Text as="span" size="sm" tone="danger" id={problemId}>
                                {problem}
                            </Text>
                        ) : null}
                        <Button onPress={close} className={styles.cancel}>
                            {intl.formatMessage(messages.editorCancel)}
                        </Button>
                        <Button
                            variant="primary"
                            isDisabled={problem !== null}
                            aria-describedby={problem !== null ? problemId : undefined}
                            onPress={() => {
                                onApply(result());
                                close();
                            }}
                        >
                            {applyLabel ?? intl.formatMessage(messages.editorApply)}
                        </Button>
                    </span>
                </div>
            )}
        >
            <div className={styles.layout}>
                <div className={styles.stageColumn}>
                    {start.changed ? (
                        <Alert
                            tone="warning"
                            title={intl.formatMessage(messages.editorMediaChangedTitle)}
                        >
                            {intl.formatMessage(messages.editorMediaChanged)}
                        </Alert>
                    ) : null}
                    <div className={styles.stage}>
                        <svg
                            ref={setStage}
                            className={styles.canvas}
                            viewBox={`0 0 ${String(view.width)} ${String(view.height)}`}
                            role="group"
                            aria-label={intl.formatMessage(messages.editorCanvas, {
                                name: image.label,
                            })}
                        >
                            {drawing}
                            <path
                                d={`M0 0 H${String(view.width)} V${String(view.height)} H0 Z M${String(crop.x)} ${String(crop.y)} V${String(crop.y + crop.height)} H${String(crop.x + crop.width)} V${String(crop.y)} Z`}
                                className={styles.dim}
                                fillRule="evenodd"
                            />
                            {tool?.id !== 'crop' ? (
                                <rect
                                    x={crop.x}
                                    y={crop.y}
                                    width={crop.width}
                                    height={crop.height}
                                    className={styles.frameBorder}
                                />
                            ) : null}
                            {tool?.renderOverlay?.(context)}
                        </svg>
                    </div>
                    <Text size="sm" muted id={hintId} className={styles.hint}>
                        {tool?.hint}
                    </Text>
                </div>

                <div className={styles.side}>
                    {tools.length > 1 ? (
                        <SegmentedControl
                            aria-label={intl.formatMessage(messages.editorTools)}
                            fullWidth
                            value={tool?.id}
                            onChange={setToolId}
                            options={tools.map((candidate) => ({
                                value: candidate.id,
                                label: candidate.label,
                                icon: candidate.icon,
                            }))}
                        />
                    ) : null}
                    {own !== null ? (
                        <Alert tone="info" className={styles.baseNote}>
                            {intl.formatMessage(
                                base === 'media'
                                    ? messages.editorBaseMediaNote
                                    : messages.editorBaseOriginalNote,
                            )}
                        </Alert>
                    ) : null}
                    {start.proposed && tool?.id === 'crop' ? (
                        <Text size="sm">{intl.formatMessage(messages.editorCropProposed)}</Text>
                    ) : null}
                    {tool?.renderPanel(context)}
                    <div className={styles.result}>
                        <svg
                            role="img"
                            aria-label={image.label}
                            viewBox={viewBox(crop)}
                            className={styles.resultImage}
                        >
                            {drawing}
                        </svg>
                        <div className={styles.resultText}>
                            <Text size="sm" weight="medium">
                                {intl.formatMessage(messages.editorResult)}
                            </Text>
                            <Text size="sm" muted numeric>
                                {intl.formatMessage(messages.editorResultSize, {
                                    width: Math.round(crop.width),
                                    height: Math.round(crop.height),
                                    ratio: ratioLabel(crop.width, crop.height),
                                })}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
