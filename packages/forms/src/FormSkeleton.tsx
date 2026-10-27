import type { CSSProperties, ReactNode } from 'react';

import type { Field, LayoutNode } from '@panneau/protocol';
import { LoadingRegion, Skeleton, usePanneauIntl } from '@panneau/ui';

import styles from './Form.module.css';
import { cx } from './cx';
import { messages } from './messages';

/** The height of a field's control, by type: one line, unless the type says otherwise. */
const HEIGHTS: Readonly<Record<string, string>> = {
    textarea: '6rem',
    json: '8rem',
    richtext: '10rem',
    html: '10rem',
    file: '6rem',
    media: '6rem',
    image: '8rem',
    group: '8rem',
    repeater: '8rem',
    location: '16rem',
};

/** A label's line, about as wide as its text. */
function LabelSkeleton({ text }: { text: string | undefined }) {
    const length = Math.max(4, Math.min(text?.length ?? 10, 40));
    return <Skeleton className={styles.skeletonLabel} width={`${String(length)}ch`} />;
}

function FieldSkeleton({ field }: { field: Field | undefined }) {
    if (field?.type === 'boolean') {
        return (
            <div className={styles.skeletonInline}>
                <Skeleton shape="rect" width="1.25rem" height="1.25rem" />
                <LabelSkeleton text={field.label} />
            </div>
        );
    }
    return (
        <div className={styles.skeletonField}>
            <LabelSkeleton text={field?.label ?? field?.name} />
            <Skeleton
                shape="rect"
                height={HEIGHTS[field?.type ?? ''] ?? 'var(--panneau-control-height)'}
            />
        </div>
    );
}

function NodeSkeleton({
    node,
    fields,
}: {
    node: LayoutNode;
    fields: ReadonlyMap<string, Field>;
}): ReactNode {
    switch (node.type) {
        case 'field':
            return node.name !== undefined && fields.has(node.name) ? (
                <FieldSkeleton field={fields.get(node.name)} />
            ) : null;
        case 'row':
            return (
                <div className={styles.row}>
                    {(node.children ?? []).map((child, index) => (
                        <div
                            key={index}
                            className={styles.cell}
                            style={{ '--panneau-span': child.width ?? 12 } as CSSProperties}
                        >
                            <NodeSkeleton node={child} fields={fields} />
                        </div>
                    ))}
                </div>
            );
        case 'tabs': {
            // The tabs, and the content of the first one.
            const tabs = (node.children ?? []).filter((child) => child.type === 'tab');
            return (
                <div className={styles.stack}>
                    <div className={styles.skeletonTabs}>
                        {tabs.map((tab, index) => (
                            <LabelSkeleton key={index} text={tab.label} />
                        ))}
                    </div>
                    <NodesSkeleton nodes={tabs[0]?.children ?? []} fields={fields} />
                </div>
            );
        }
        case 'section':
            return (
                <div className={styles.section}>
                    {node.label !== undefined ? (
                        <Skeleton
                            className={styles.sectionTitle}
                            width={`${String(Math.min(node.label.length, 40))}ch`}
                        />
                    ) : null}
                    {node.collapsible === true && node.collapsed === true ? null : (
                        <NodesSkeleton nodes={node.children ?? []} fields={fields} />
                    )}
                </div>
            );
        case 'text':
            return <Skeleton className={styles.text} lines={2} />;
        case 'component':
            return null;
        default:
            return <NodesSkeleton nodes={node.children ?? []} fields={fields} />;
    }
}

function NodesSkeleton({
    nodes,
    fields,
}: {
    nodes: readonly LayoutNode[];
    fields: ReadonlyMap<string, Field>;
}) {
    return (
        <div className={styles.stack}>
            {nodes.map((node, index) => (
                <NodeSkeleton key={index} node={node} fields={fields} />
            ))}
        </div>
    );
}

export interface FormSkeletonProps {
    /** The main nodes of the layout, resolved: every field has a node. */
    main: readonly LayoutNode[];
    /** The sidebars of the layout. */
    sidebar: readonly LayoutNode[];
    fields: ReadonlyMap<string, Field>;
    /** Draws the footer, with its button. */
    footer: boolean;
    className?: string | undefined;
    layoutClassName?: string | undefined;
    sidebarClassName?: string | undefined;
    footerClassName?: string | undefined;
}

/**
 * A form whose values load (decision 0034): its layout, and for each field its label and a block
 * of the field's height, from its type. The fields of the first tab are drawn, and conditions are
 * not checked, since there are no values yet.
 */
export function FormSkeleton({
    main,
    sidebar,
    fields,
    footer,
    className,
    layoutClassName,
    sidebarClassName,
    footerClassName,
}: FormSkeletonProps) {
    const intl = usePanneauIntl();
    return (
        <LoadingRegion
            label={intl.formatMessage(messages.loading)}
            className={cx(styles.form, className)}
        >
            <div
                className={cx(
                    styles.layout,
                    sidebar.length > 0 && styles.withSidebar,
                    layoutClassName,
                )}
            >
                <NodesSkeleton nodes={main} fields={fields} />
                {sidebar.length > 0 ? (
                    <div className={cx(styles.sidebar, sidebarClassName)}>
                        {sidebar.map((node, index) => (
                            <NodesSkeleton
                                key={index}
                                nodes={node.children ?? []}
                                fields={fields}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
            {footer ? (
                <div className={cx(styles.footer, footerClassName)}>
                    <Skeleton shape="rect" width="6rem" height="var(--panneau-control-height)" />
                </div>
            ) : null}
        </LoadingRegion>
    );
}
