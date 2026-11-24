import { FilePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button as AriaButton, Dialog, Modal, ModalOverlay } from 'react-aria-components';

import { type ResolvedResource, getItemValues, resolveForm } from '@panneau/core';
import { ForbiddenError, NotFoundError } from '@panneau/data';
import { useCreateItem, useDataAdapter, useResourceItem, useUpdateItem } from '@panneau/data/query';
import { type RelationSource, createFieldCheckSource, useFieldsContext } from '@panneau/fields';
import { Form, useLeaveConfirmation } from '@panneau/forms';
import { appMessages } from '@panneau/intl';
import type { Definition, Item } from '@panneau/protocol';
import {
    ITEM_TYPE_KEY,
    getCreatableTypes,
    getItemType,
    getResourceType,
    hasResourceTypes,
} from '@panneau/protocol/runtime';
import {
    Alert,
    Aside,
    Button,
    Icon,
    getNamedIcon,
    usePanneauIntl,
    usePortalContainer,
} from '@panneau/ui';

import styles from './RelatedItemPanel.module.css';
import { ActionsPanel, FormPageContext } from './formPage';
import { getItemTitle } from './itemTitle';
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
    nested.canEdit = () => false;
    nested.linksInNewTab = true;
    return nested;
}

export interface RelatedItemPanelProps {
    /** The resource of the item. */
    resolved: ResolvedResource;
    /** The first values of a new item: the text typed in the field, as its title. */
    values?: Record<string, unknown> | undefined;
    /** The id of the item to edit, from its card. Without it, the panel creates an item. */
    id?: string | undefined;
    definition: Definition;
    basePath: string;
    /** Closes the panel: with the item once it is saved, or `null`. */
    onClose: (item: Item | null) => void;
}

/** The label of the panel: "New person", or "Edit the person". */
export function getRelatedItemPanelLabel(
    intl: ReturnType<typeof usePanneauIntl>,
    resource: ResolvedResource['resource'],
    id: string | undefined,
): string {
    return intl.formatMessage(id !== undefined ? appMessages.edit : appMessages.create, {
        resource: resource.label.singular,
    });
}

/**
 * The form of an item of a resource, in the panel over the page where a relation field creates its
 * item, or where a card edits its own (decision 0110): the whole form of the resource, with its
 * layout, its validation and its errors, after the choice of a type in a resource with types
 * (decision 0077). An item to edit is loaded again when the panel opens, so that its form starts
 * from its latest version. Closing it with unsaved changes asks first.
 */
export function RelatedItemPanel({
    resolved,
    values = {},
    id,
    definition,
    basePath,
    onClose,
}: RelatedItemPanelProps) {
    const intl = usePanneauIntl();
    const adapter = useDataAdapter();
    const { relationSource } = useFieldsContext();
    const { resource } = resolved;
    const mode = id !== undefined ? 'update' : 'create';
    const createItem = useCreateItem(resource.id);
    const updateItem = useUpdateItem(resource.id);
    // The item to edit, as the server has it now: what a list or a field cached may be older
    const [openedAt] = useState(Date.now);
    const itemQuery = useResourceItem(resource.id, id ?? null, { refetchOnMount: 'always' });
    const item =
        itemQuery.data !== undefined && itemQuery.dataUpdatedAt >= openedAt
            ? itemQuery.data
            : undefined;
    const failed = mode === 'update' && item === undefined && itemQuery.isError;
    // A resource with types asks for one first, unless only one can be created. An item has its own.
    const creatable = getCreatableTypes(resource);
    const [chosen, setChosen] = useState(creatable.length === 1 ? creatable[0]?.id : undefined);
    const type =
        mode === 'update'
            ? item !== undefined
                ? getItemType(resource, item)
                : undefined
            : getResourceType(resource, chosen);
    const choosing = mode === 'create' && hasResourceTypes(resource) && type === undefined;
    const { fields, layout } = resolveForm(resource, { mode, type: type?.id });
    const checkSource = createFieldCheckSource(adapter, resource.id, id ?? null);
    const singular = resource.label.singular;
    const title =
        mode === 'update'
            ? (getItemTitle(item, resource.itemTitle, definition.locale) ??
              getRelatedItemPanelLabel(intl, resource, id))
            : intl.formatMessage(appMessages.create, { resource: type?.label ?? singular });
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
                label={mode === 'update' ? getRelatedItemPanelLabel(intl, resource, id) : title}
                title={mode === 'update' && item === undefined ? undefined : title}
                isLoading={mode === 'update' && item === undefined && !failed}
                onClose={close}
                className={styles.panel}
            >
                {failed && itemQuery.error instanceof NotFoundError ? (
                    <Alert tone="warning">
                        <p>{intl.formatMessage(appMessages.itemGone, { resource: singular })}</p>
                    </Alert>
                ) : failed && itemQuery.error instanceof ForbiddenError ? (
                    // An item the user can't view: retrying won't help (decision 0046)
                    <Alert tone="warning">
                        <p>
                            {intl.formatMessage(appMessages.itemForbidden, { resource: singular })}
                        </p>
                    </Alert>
                ) : failed ? (
                    <Alert tone="danger">
                        <p>
                            {intl.formatMessage(appMessages.itemLoadError, { resource: singular })}
                        </p>
                        <Button size="sm" onPress={() => void itemQuery.refetch()}>
                            {intl.formatMessage(appMessages.retry)}
                        </Button>
                    </Alert>
                ) : item !== undefined && item.abilities.update !== true ? (
                    // As its edit page, which the user can't open either (decision 0046)
                    <Alert tone="warning">
                        <p>
                            {intl.formatMessage(appMessages.itemUpdateForbidden, {
                                resource: singular,
                            })}
                        </p>
                    </Alert>
                ) : choosing ? (
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
                            item,
                            basePath,
                            locale: definition.locale,
                            // Not its actions, such as "Delete": the panel edits its item, and
                            // the field would keep a card of an item that is gone
                            actions: undefined,
                        }}
                    >
                        <Form
                            // While the item loads, the form draws its skeleton; it starts over
                            // from the item's values once it is there
                            key={
                                mode === 'update'
                                    ? item !== undefined
                                        ? 'item'
                                        : 'loading'
                                    : (type?.id ?? 'new')
                            }
                            aria-label={title}
                            footerClassName={styles.footer}
                            isLoading={mode === 'update' && item === undefined}
                            fields={fields}
                            layout={layout}
                            values={
                                mode === 'update'
                                    ? item !== undefined
                                        ? getItemValues(
                                              item,
                                              fields.map((field) => field.name),
                                          )
                                        : undefined
                                    : values
                            }
                            version={item?.version ?? null}
                            item={item}
                            mode={mode}
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
                            onSubmit={(submitted, { version, changes }) =>
                                id !== undefined
                                    ? updateItem.mutateAsync({ id, values: changes, version })
                                    : createItem.mutateAsync(
                                          type !== undefined
                                              ? { ...submitted, [ITEM_TYPE_KEY]: type.id }
                                              : submitted,
                                      )
                            }
                            onSubmitted={(result) => onClose(result as Item)}
                            onReload={() => void itemQuery.refetch()}
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
                    aria-label={getRelatedItemPanelLabel(intl, props.resolved.resource, props.id)}
                    className={styles.dialog}
                >
                    <RelatedItemPanel {...props} />
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
