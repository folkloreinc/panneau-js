import {
    type CSSProperties,
    type ReactNode,
    createElement,
    use,
    useEffect,
    useId,
    useState,
} from 'react';

import {
    type Form,
    getLayoutFieldNames,
    selectErrorCount,
    selectVisible,
    usePlugins,
} from '@panneau/core';
import { NestedField, isWideField } from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import {
    AsidePanel,
    Badge,
    Disclosure,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    usePanneauIntl,
    usePreference,
} from '@panneau/ui';

import styles from '../Form.module.css';
import { ErrorSectionsContext, RevealContext, useFormContext, useFormState } from '../context';
import { cx } from '../cx';
import { messages } from '../messages';

export interface LayoutProps {
    nodes: readonly LayoutNode[];
    fields: ReadonlyMap<string, Field>;
}

/** Whether a path belongs to one of the field names (`title.fr` to `title`). */
function containsPath(names: readonly string[], path: string): boolean {
    const name = path.split('.')[0];
    return name !== undefined && names.includes(name);
}

function ErrorBadge({ form, names }: { form: Form; names: readonly string[] }) {
    const intl = usePanneauIntl();
    const count = selectErrorCount(useFormState(form), names);
    if (count === 0) {
        return null;
    }
    return (
        <Badge tone="danger" label={intl.formatMessage(messages.errorCount, { count })}>
            {count}
        </Badge>
    );
}

function TabsNode({ node, fields }: { node: LayoutNode; fields: ReadonlyMap<string, Field> }) {
    const form = useFormContext();
    const state = useFormState(form);
    const registry = use(RevealContext);
    const id = useId();
    const tabs = (node.children ?? []).filter(
        (child) => child.type === 'tab' && selectVisible(state, child),
    );
    const names = tabs.map((tab) => getLayoutFieldNames(tab.children ?? []));
    const [selected, setSelected] = useState<string>(`${id}-0`);

    useEffect(
        () =>
            registry.add((path) => {
                const index = names.findIndex((tabNames) => containsPath(tabNames, path));
                if (index !== -1) {
                    setSelected(`${id}-${index}`);
                }
            }),
        [registry, names, id],
    );

    return (
        <Tabs selectedKey={selected} onSelectionChange={(key) => setSelected(String(key))}>
            <TabList aria-label={node.label ?? tabs.map((tab) => tab.label ?? '').join(', ')}>
                {tabs.map((tab, index) => (
                    <Tab key={index} id={`${id}-${index}`}>
                        {tab.label} <ErrorBadge form={form} names={names[index] ?? []} />
                    </Tab>
                ))}
            </TabList>
            {tabs.map((tab, index) => (
                // Panels stay mounted: fields keep their state, and errors can be revealed.
                <TabPanel key={index} id={`${id}-${index}`} shouldForceMount>
                    <div className={styles.stack}>
                        <LayoutNodes nodes={tab.children ?? []} fields={fields} />
                    </div>
                </TabPanel>
            ))}
        </Tabs>
    );
}

function SectionNode({ node, fields }: { node: LayoutNode; fields: ReadonlyMap<string, Field> }) {
    const form = useFormContext();
    const registry = use(RevealContext);
    const errorSections = use(ErrorSectionsContext);
    const titleId = useId();
    const names = getLayoutFieldNames(node.children ?? []);
    const [expanded, setExpanded] = useState(node.collapsed !== true);

    // Opens to reveal a field, and after a failed save when it holds an error
    useEffect(() => {
        const open = (path: string) => {
            if (containsPath(names, path)) {
                setExpanded(true);
            }
        };
        const removeRevealer = registry.add(open);
        const removeOpener = errorSections.add(open);
        return () => {
            removeRevealer();
            removeOpener();
        };
    }, [registry, errorSections, names]);

    const content = (
        <>
            {node.description !== undefined ? (
                <p className={styles.sectionDescription}>{node.description}</p>
            ) : null}
            <div className={styles.stack}>
                <LayoutNodes nodes={node.children ?? []} fields={fields} />
            </div>
        </>
    );
    if (node.collapsible === true) {
        return (
            <div className={styles.section}>
                <Disclosure
                    title={node.label}
                    titleEnd={<ErrorBadge form={form} names={names} />}
                    isExpanded={expanded}
                    onExpandedChange={setExpanded}
                >
                    <div className={styles.stack}>{content}</div>
                </Disclosure>
            </div>
        );
    }
    return (
        <section
            className={styles.section}
            aria-labelledby={node.label !== undefined ? titleId : undefined}
        >
            {node.label !== undefined ? (
                <div className={styles.sectionHeader}>
                    <h3 id={titleId} className={styles.sectionTitle}>
                        {node.label} <ErrorBadge form={form} names={names} />
                    </h3>
                </div>
            ) : null}
            {content}
        </section>
    );
}

const PANEL_STATES = ['expanded', 'collapsed'] as const;

export interface SidebarNodeProps {
    node: LayoutNode;
    fields: ReadonlyMap<string, Field>;
    /** Where the browser remembers whether the panel is collapsed (`Form`'s `sidebarStorageKey`). */
    storageKey?: string | undefined;
}

/**
 * A `sidebar` node of a form layout: a panel of the form's aside (decision 0073). With a `label`,
 * the user can collapse it, unless `collapsible: false`, and the browser remembers it. It opens to
 * reveal a field, and after a failed save when it holds an error, as a section does.
 */
export function SidebarNode({ node, fields, storageKey }: SidebarNodeProps) {
    const form = useFormContext();
    const registry = use(RevealContext);
    const errorSections = use(ErrorSectionsContext);
    const names = getLayoutFieldNames(node.children ?? []);
    const collapsible = node.label !== undefined && node.collapsible !== false;
    const [stored, setStored] = usePreference(
        collapsible && storageKey !== undefined && node.label !== undefined
            ? `${storageKey}-panel-${node.name ?? node.label}`
            : null,
        PANEL_STATES,
    );
    const [expanded, setExpanded] = useState(
        stored !== null ? stored === 'expanded' : node.collapsed !== true,
    );

    useEffect(() => {
        const open = (path: string) => {
            if (containsPath(names, path)) {
                setExpanded(true);
            }
        };
        const removeRevealer = registry.add(open);
        const removeOpener = errorSections.add(open);
        return () => {
            removeRevealer();
            removeOpener();
        };
    }, [registry, errorSections, names]);

    return (
        <AsidePanel
            title={node.label}
            titleEnd={
                node.label !== undefined ? <ErrorBadge form={form} names={names} /> : undefined
            }
            isCollapsible={collapsible}
            isExpanded={expanded}
            onExpandedChange={(next) => {
                setExpanded(next);
                setStored(next ? 'expanded' : 'collapsed');
            }}
        >
            <div className={styles.stack}>
                {node.description !== undefined ? (
                    <p className={styles.sectionDescription}>{node.description}</p>
                ) : null}
                <LayoutNodes nodes={node.children ?? []} fields={fields} />
            </div>
        </AsidePanel>
    );
}

/** What the component of a `component` node of a form layout gets, with the node's `props`. */
export interface LayoutComponentProps {
    node: LayoutNode;
    form: Form;
    /** The fields of the form, by name. */
    fields: ReadonlyMap<string, Field>;
    /** The node's children, rendered: the fields a component frames (decision 0065). */
    children: ReactNode;
}

/**
 * A `component` node: the plugin's component, with the node's children rendered. Without the
 * plugin, the children show as in a column, so that the fields the node frames stay in the form
 * (decision 0065).
 */
function ComponentNode({ node, fields }: { node: LayoutNode; fields: ReadonlyMap<string, Field> }) {
    const form = useFormContext();
    const { components } = usePlugins();
    const Component = node.component !== undefined ? components.get(node.component) : undefined;
    const children =
        node.children !== undefined && node.children.length > 0 ? (
            <div className={styles.stack}>
                <LayoutNodes nodes={node.children} fields={fields} />
            </div>
        ) : null;
    if (Component === undefined) {
        return children;
    }
    // A component of the plugin registry, looked up by name: not created during render.
    return createElement(Component, { ...node.props, node, form, fields, children });
}

function LayoutNodeView({
    node,
    fields,
}: {
    node: LayoutNode;
    fields: ReadonlyMap<string, Field>;
}) {
    const form = useFormContext();
    const state = useFormState(form);
    if (!selectVisible(state, node)) {
        return null;
    }
    switch (node.type) {
        case 'field': {
            const field = node.name !== undefined ? fields.get(node.name) : undefined;
            return field !== undefined ? (
                <NestedField field={field} path={field.name} parentValue={state.values} />
            ) : null;
        }
        case 'row':
            return (
                <div className={styles.row}>
                    {(node.children ?? []).map((child, index) => (
                        <div
                            key={index}
                            className={styles.cell}
                            style={{ '--panneau-span': child.width ?? 12 } as CSSProperties}
                        >
                            <LayoutNodeView node={child} fields={fields} />
                        </div>
                    ))}
                </div>
            );
        case 'tabs':
            return <TabsNode node={node} fields={fields} />;
        case 'section':
            return <SectionNode node={node} fields={fields} />;
        case 'text':
            return <p className={styles.text}>{node.text ?? node.label}</p>;
        case 'component':
            return <ComponentNode node={node} fields={fields} />;
        default:
            // `column`, a `tab` or a `sidebar` out of place, and unknown containers.
            return (
                <div className={styles.stack}>
                    <LayoutNodes nodes={node.children ?? []} fields={fields} />
                </div>
            );
    }
}

/** Renders layout nodes in order. */
export function LayoutNodes({ nodes, fields }: LayoutProps): ReactNode {
    return nodes.map((node, index) => <LayoutNodeView key={index} node={node} fields={fields} />);
}

/**
 * Fields that the layout doesn't place, in columns: short fields side by side, wide ones
 * (`isWideField()`) on their own row.
 */
export function FieldFlow({ nodes, fields }: LayoutProps): ReactNode {
    return (
        <div className={styles.flow}>
            {nodes.map((node, index) => {
                const field = node.name !== undefined ? fields.get(node.name) : undefined;
                return (
                    <div
                        key={index}
                        className={cx(
                            styles.flowCell,
                            (field === undefined || isWideField(field)) && styles.flowWide,
                        )}
                    >
                        <LayoutNodeView node={node} fields={fields} />
                    </div>
                );
            })}
        </div>
    );
}
