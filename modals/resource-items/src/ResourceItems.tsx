/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import React, { useMemo } from 'react';
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
    onClose?: (() => void) | null;
    listProps?: Record<string, unknown> | null;
    className?: string | null;
    children?: React.ReactNode | null;
}

function ModalResourceItems({
    id,
    resource: providedResource = null,
    title = null,
    query: initialQuery = null,
    paginated = true,
    size = 'xl',
    onClose = null,
    listProps = null,
    className = null,
    children = null,
    ...props
}: ModalResourceItemsProps) {
    const panneauResource = usePanneauResource(providedResource);
    const resource = isObject(providedResource) ? providedResource : panneauResource;

    const resourceValues = useResourceValues(resource);
    const finalQuery = useMemo(() => ({ ...initialQuery }), [initialQuery]);
    const { query, onPageChange, onQueryChange, onQueryReset } = useQuery(finalQuery, paginated);

    // TODO: add default list props and stuff?

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
            onClose={onClose}
            className={className}
        >
            <ResourceItemsList
                resource={resource}
                query={query}
                onPageChange={onPageChange}
                onQueryChange={onQueryChange}
                onQueryReset={onQueryReset}
                listProps={listProps}
                {...props}
            />
            {children}
        </Dialog>
    );
}

export default ModalResourceItems;
