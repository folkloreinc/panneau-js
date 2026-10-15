import {
    type CSSProperties,
    type ReactNode,
    createElement,
    use,
    useEffect,
    useId,
    useState,
} from 'react';

import { type Form, getLayoutFieldNames, usePlugins } from '@panneau/core';
import { NestedField } from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import { Badge, Disclosure, Tab, TabList, TabPanel, Tabs, usePanneauIntl } from '@panneau/ui';

import styles from '../Form.module.css';
import {
    RevealContext,
    selectErrorCount,
    selectVisible,
    useFormContext,
    useFormState,
} from '../context';
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
    const titleId = useId();
    const names = getLayoutFieldNames(node.children ?? []);
    const [expanded, setExpanded] = useState(node.collapsed !== true);

    useEffect(
        () =>
            registry.add((path) => {
                if (containsPath(names, path)) {
                    setExpanded(true);
                }
            }),
        [registry, names],
    );

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

function ComponentNode({ node }: { node: LayoutNode }) {
    const form = useFormContext();
    const { components } = usePlugins();
    const Component = node.component !== undefined ? components.get(node.component) : undefined;
    if (Component === undefined) {
        return null;
    }
    // A component of the plugin registry, looked up by name: not created during render.
    return createElement(Component, { ...node.props, node, form });
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
            return <ComponentNode node={node} />;
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
