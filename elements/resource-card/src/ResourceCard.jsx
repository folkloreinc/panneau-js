import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { getPathValue } from '@panneau/core/utils';
import Button from '@panneau/element-button';

// import Icon from '@panneau/element-icon';
// import Label from '@panneau/element-label';

const propTypes = {
    item: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    getItemLabel: PropTypes.func,
    getItemDescription: PropTypes.func,
    getItemImage: PropTypes.func,
    itemLabelPath: PropTypes.string,
    itemDescriptionPath: PropTypes.string,
    itemImagePath: PropTypes.string,
    itemLabelWithId: PropTypes.bool,
    onClickEdit: PropTypes.func,
    onClickRemove: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.node,
    footer: PropTypes.node,
};

const defaultProps = {
    item: null,
    getItemLabel: getPathValue,
    getItemDescription: getPathValue,
    getItemImage: getPathValue,
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    itemImagePath: 'image',
    itemLabelWithId: false,
    onClickEdit: null,
    onClickRemove: null,
    disabled: false,
    className: null,
    children: null,
    header: null,
    footer: null,
};

const ResourceCard = ({
    item,
    itemLabelPath,
    itemDescriptionPath,
    itemImagePath,
    itemLabelWithId,
    getItemLabel: initialGetItemLabel,
    getItemDescription,
    getItemImage,
    onClickEdit,
    onClickRemove,
    disabled,
    children,
    header,
    footer,
    className,
}) => {
    const getItemLabel = useCallback(
        (it, path) => {
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
                    [className]: className !== null,
                },
            ])}
        >
            {header !== null ? <div className="card-header p-1 ps-2">{header}</div> : null}
            <div className="card-body p-1 pl-2">
                <div className="d-flex align-items-center">
                    {itemImage !== null ? (
                        <img
                            src={itemImage}
                            alt={itemLabel}
                            className="flex-shrink-0 me-2"
                            width="20"
                        />
                    ) : null}
                    <div className="flex-grow-1 ms-1">
                        <h6 className="m-0">{itemLabel}</h6>
                        {!isEmpty(itemDescription) ? (
                            <p className="m-0">
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
                            />
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
                            />
                        </div>
                    ) : null}
                </div>
                {children}
            </div>
            {footer !== null ? <div className="card-footer p-1 ps-2">{footer}</div> : null}
        </div>
    );
};

ResourceCard.propTypes = propTypes;
ResourceCard.defaultProps = defaultProps;

export default ResourceCard;
