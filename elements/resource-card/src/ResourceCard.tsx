import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { type ReactNode, useCallback } from 'react';

import type { Message } from '@panneau/core';
import { getPathValue } from '@panneau/core/utils';
import Button from '@panneau/element-button';

interface ResourceItem {
    id?: string | number;
    [key: string]: any;
}

interface ResourceCardProps {
    item?: ResourceItem | null;
    itemLabelPath?: string;
    itemDescriptionPath?: string | null;
    itemImagePath?: string | null;
    itemLabelWithId?: boolean;
    getItemLabel?: (item: ResourceItem, path: string) => string | null;
    getItemDescription?: (item: ResourceItem, path: string | null) => string | null;
    getItemImage?: (item: ResourceItem, path: string | null) => string | null;
    onClickEdit?: (() => void) | null;
    onClickRemove?: (() => void) | null;
    editButtonLabel?: Message | null;
    removeButtonLabel?: Message | null;
    disabled?: boolean;
    className?: string | null;
    children?: ReactNode | null;
    header?: ReactNode | null;
    footer?: ReactNode | null;
}

function ResourceCard({
    item = null,
    itemLabelPath = 'label',
    itemDescriptionPath = null,
    itemImagePath = null,
    itemLabelWithId = false,
    getItemLabel: initialGetItemLabel = getPathValue,
    getItemDescription = getPathValue,
    getItemImage = getPathValue,
    onClickEdit = null,
    onClickRemove = null,
    editButtonLabel = null,
    removeButtonLabel = null,
    disabled = false,
    children = null,
    header = null,
    footer = null,
    className = null,
}: ResourceCardProps) {
    const getItemLabel = useCallback(
        (it: ResourceItem, path: string) => {
            const id = get(it, 'id', null);
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId],
    );
    const itemLabel = item !== null ? getItemLabel(item, itemLabelPath) : null;
    const itemDescription = item !== null ? getItemDescription(item, itemDescriptionPath) : null;
    const itemImage = item !== null ? getItemImage(item, itemImagePath) : null;

    return (
        <div
            className={classNames([
                'card',
                {
                    [`bg-muted`]: disabled,
                    [`text-muted`]: disabled,
                },
                className,
            ])}
        >
            {header !== null ? <div className="card-header p-1 ps-2">{header}</div> : null}
            <div className="card-body p-1 pl-2">
                <div className="d-flex align-items-center">
                    {itemImage !== null ? (
                        <img
                            src={itemImage}
                            alt={itemLabel || undefined}
                            className="flex-shrink-0 me-2"
                            width="20"
                        />
                    ) : null}
                    <div className="flex-grow-1 ms-1">
                        <h6 className="m-0 text-break">{itemLabel}</h6>
                        {!isEmpty(itemDescription) ? (
                            <p className="m-0 text-break">
                                <small>{itemDescription}</small>
                            </p>
                        ) : null}
                    </div>
                    {onClickEdit !== null ? (
                        <div className="ms-1">
                            <Button
                                type="button"
                                size="sm"
                                theme="secondary"
                                icon="pencil-square"
                                outline={disabled}
                                onClick={onClickEdit}
                                disabled={disabled}
                            >
                                {editButtonLabel}
                            </Button>
                        </div>
                    ) : null}
                    {onClickRemove !== null ? (
                        <div className="ms-1">
                            <Button
                                type="button"
                                size="sm"
                                theme="secondary"
                                icon="x-lg"
                                outline={disabled}
                                onClick={onClickRemove}
                                disabled={disabled}
                            >
                                {removeButtonLabel}
                            </Button>
                        </div>
                    ) : null}
                </div>
                {children}
            </div>
            {footer !== null ? <div className="card-footer p-1 ps-2">{footer}</div> : null}
        </div>
    );
}

export default ResourceCard;
