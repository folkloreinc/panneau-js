import isObject from 'lodash/isObject';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { usePanneauResource } from '@panneau/core/contexts';
import { useQuery } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';
import ResourceItemsList from '@panneau/list-resource-items';
import Dialog from '@panneau/modal-dialog';

interface ModalResourceItemsProps {
    id: string | number;
    resource?: string | null;
    title?: string | null;
    query?: Record<string, unknown> | null;
    paginated?: boolean;
    size?: string;
    withoutCloseOnSelect?: boolean;
    onClosed?: (() => void) | null;
    onSelect?: ((item: unknown) => void) | null;
    multiple?: boolean;
    listProps?: Record<string, unknown> | null;
    confirmButton?: Record<string, unknown> | null;
    cancelButton?: Record<string, unknown> | null;
    className?: string | null;
    children?: ReactNode | null;
}

function ModalResourceItems({
    id,
    resource: providedResource = null,
    title = null,
    query: initialQuery = null,
    paginated = true,
    size = 'xl',
    onClosed = null,
    onSelect = null,
    multiple = false,
    listProps = null,
    confirmButton = null,
    cancelButton = null,
    withoutCloseOnSelect = false,
    className = null,
    children = null,
    ...props
}: ModalResourceItemsProps) {
    const [opened, setOpened] = useState(true);
    const requestClose = useCallback(() => {
        setOpened(false);
    }, [onClosed]);
    const resource = usePanneauResource(providedResource);
    const resourceValues = useResourceValues(resource);
    const finalQuery = useMemo(() => ({ ...initialQuery }), [initialQuery]);
    const { query, onPageChange, onQueryChange, onQueryReset } = useQuery(finalQuery, paginated);

    const finalOnPageChange = useCallback(
        (e, pageNumber = null) => {
            e.preventDefault();
            e.stopPropagation();
            onPageChange(pageNumber);
        },
        [onPageChange],
    );

    const finalOnQueryChange = useCallback(
        (newQuery: Record<string, unknown>) => {
            onQueryChange(newQuery);
        },
        [onQueryChange],
    );

    const [selectedItems, setSelectedItems] = useState(null);

    const onSelectionChange = useCallback(
        (newSelectedItems) => {
            console.log({
                newSelectedItems
            })
            setSelectedItems(newSelectedItems);
        },
        [setSelectedItems],
    );

    const onClickCancel = useCallback(() => {
        setSelectedItems(null);
        requestClose();
    }, [requestClose]);

    const onClickConfirm = useCallback(() => {
        if (onSelect !== null) {
            onSelect(selectedItems);
        }
        if (!withoutCloseOnSelect) {
            requestClose();
        }
    }, [multiple, requestClose, withoutCloseOnSelect, onSelect, selectedItems]);

    return (
        <Dialog
            id={id}
            title={
                title || (
                    <FormattedMessage
                        values={resourceValues}
                        defaultMessage="Find {a_singular}"
                        description="Page title"
                    />
                )
            }
            size={size}
            visible={opened}
            requestClose={requestClose}
            onClosed={onClosed}
            buttons={[
                {
                    id: 'no',
                    label: <FormattedMessage defaultMessage="Cancel" description="Button label" />,
                    theme: 'secondary',
                    onClick: onClickCancel,
                    ...cancelButton,
                },
                {
                    id: 'yes',
                    disabled: selectedItems == null || selectedItems.length === 0,
                    label: <FormattedMessage defaultMessage="Confirm" description="Button label" />,
                    theme: 'primary',
                    onClick: onClickConfirm,
                    ...confirmButton,
                },
            ]}
            className={className}
        >
            <ResourceItemsList
                resource={resource}
                query={query}
                onPageChange={finalOnPageChange}
                onQueryChange={finalOnQueryChange}
                onQueryReset={onQueryReset}
                selectable
                selectedItems={selectedItems}
                onSelectionChange={onSelectionChange}
                multipleSelection={multiple}
                {...props}
            />
            {children}
        </Dialog>
    );
}

export default ModalResourceItems;
