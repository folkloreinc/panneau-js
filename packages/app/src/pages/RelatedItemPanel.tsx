import { FilePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button as AriaButton, Dialog, Modal, ModalOverlay } from 'react-aria-components';

import { type ResolvedResource, resolveForm } from '@panneau/core';
import { useCreateItem, useDataAdapter } from '@panneau/data/query';
import { type RelationSource, createFieldCheckSource, useFieldsContext } from '@panneau/fields';
import { Form, useLeaveConfirmation } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import type { Definition, Item } from '@panneau/protocol';
import {
    ITEM_TYPE_KEY,
    getCreatableTypes,
    getResourceType,
    hasResourceTypes,
} from '@panneau/protocol/runtime';
import { Aside, Button, Icon, getNamedIcon, usePanneauIntl, usePortalContainer } from '@panneau/ui';

import styles from './RelatedItemPanel.module.css';
import { ActionsPanel, FormPageContext } from './formPage';
import pageStyles from './pages.module.css';

/** The panels of the app, for the sidebars of its forms (decision 0075). */
const PANELS = { actions: ActionsPanel };

/**
 * The relation source of the fields of the panel, one level deep (decision 0110): they pick
 * existing items, without "Create …", and the links of their cards open in a new tab, which leaves
 * neither the panel nor the form under it.
 */
export function getNestedRelationSource(source: RelationSource): RelationSource {
    const nested = Object.create(source) as RelationSource;
    nested.canCreate = () => false;
    nested.linksInNewTab = true;
    return nested;
}

export interface RelatedItemPanelProps {
    /** The resource of the new item. */
    resolved: ResolvedResource;
    /** Its first values: the text typed in the field, as its title. */
    values: Record<string, unknown>;
    definition: Definition;
    basePath: string;
    /** Closes the panel: with the new item once it is saved, or `null`. */
    onClose: (item: Item | null) => void;
}

/**
 * The form to create an item of a resource, in the panel over the page where a relation field
 * creates its item (decision 0110): the whole form of the resource, with its layout, its
 * validation and its errors, after the choice of a type in a resource with types (decision 0077).
 * Closing it with unsaved changes asks first.
 */
export function RelatedItemPanel({
    resolved,
    values,
    definition,
    basePath,
    onClose,
}: RelatedItemPanelProps) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const { relationSource } = useFieldsContext();
    const { resource } = resolved;
    const createItem = useCreateItem(resource.id);
    // A resource with types asks for one first, unless only one can be created
    const creatable = getCreatableTypes(resource);
    const [chosen, setChosen] = useState(creatable.length === 1 ? creatable[0]?.id : undefined);
    const type = getResourceType(resource, chosen);
    const choosing = hasResourceTypes(resource) && type === undefined;
    const { fields, layout } = resolveForm(resource, { mode: 'create', type: type?.id });
    const checkSource = createFieldCheckSource(adapter, resource.id, null);
    const title = intl.formatMessage(appMessages.create, {
        resource: type?.label ?? resource.label.singular,
    });
    // The focus moves to the panel when it opens, as in the item panel (decision 0028): Escape
    // closes it from anywhere in it
    const panel = useRef<HTMLElement>(null);
    useEffect(() => {
        panel.current?.focus();
    }, []);
    const [dirty, setDirty] = useState(false);
    const leave = useLeaveConfirmation(dirty);
    const close = () => {
        void leave.confirmLeave().then((confirmed) => {
            if (confirmed) {
                onClose(null);
            }
        });
    };

    return (
        <>
            <Aside
                ref={panel}
                tabIndex={-1}
                label={title}
                title={title}
                onClose={close}
                className={styles.panel}
            >
                {choosing ? (
                    <>
                        <p className={pageStyles.intro}>
                            {intl.formatMessage(appMessages.chooseType, {
                                resource: resource.label.singular,
                            })}
                        </p>
                        <ul className={pageStyles.cards}>
                            {creatable.map((option) => (
                                <li key={option.id}>
                                    <AriaButton
                                        className={pageStyles.card}
                                        onPress={() => setChosen(option.id)}
                                    >
                                        <span className={pageStyles.cardIcon} aria-hidden="true">
                                            <Icon
                                                icon={
                                                    option.icon !== undefined
                                                        ? getNamedIcon(option.icon)
                                                        : FilePlus
                                                }
                                            />
                                        </span>
                                        <span className={pageStyles.cardTitle}>{option.label}</span>
                                        {option.description !== undefined ? (
                                            <span className={pageStyles.cardText}>
                                                {option.description}
                                            </span>
                                        ) : null}
                                    </AriaButton>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <FormPageContext
                        value={{
                            resource: resolved,
                            item: undefined,
                            basePath,
                            locale: definition.locale,
                            actions: undefined,
                        }}
                    >
                        <Form
                            key={type?.id ?? 'new'}
                            aria-label={title}
                            fields={fields}
                            layout={layout}
                            values={values}
                            mode="create"
                            locales={definition.locales}
                            relationSource={
                                relationSource !== null
                                    ? getNestedRelationSource(relationSource)
                                    : null
                            }
                            checkSource={checkSource}
                            panels={PANELS}
                            sidebarStorageKey={`form-${resource.id}`}
                            actions={
                                <Button appearance="ghost" onPress={close}>
                                    {intl.formatMessage(appMessages.cancel)}
                                </Button>
                            }
                            onSubmit={(submitted) =>
                                createItem.mutateAsync(
                                    type !== undefined
                                        ? { ...submitted, [ITEM_TYPE_KEY]: type.id }
                                        : submitted,
                                )
                            }
                            onSubmitted={(result) => onClose(result as Item)}
                            onDirtyChange={setDirty}
                        />
                    </FormPageContext>
                )}
            </Aside>
            {leave.dialog}
        </>
    );
}

/**
 * The panel over the page, modal: on the right, with the focus in it until it closes (decision
 * 0110). Escape and the close button go through the panel, which asks before losing changes.
 */
export function RelatedItemPanelModal(props: RelatedItemPanelProps) {
    const intl = usePanneauIntl();
    const container = usePortalContainer();
    if (container === null) {
        return null;
    }
    return (
        <ModalOverlay
            isOpen
            isKeyboardDismissDisabled
            className={styles.overlay}
            UNSTABLE_portalContainer={container}
        >
            <Modal className={styles.modal}>
                <Dialog
                    aria-label={intl.formatMessage(appMessages.create, {
                        resource: props.resolved.resource.label.singular,
                    })}
                    className={styles.dialog}
                >
                    <RelatedItemPanel {...props} />
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
