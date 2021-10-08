import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import { ResourceMessage } from '@panneau/intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const ResourceCreateButtom = ({ resource, className }) => {
    const { types = null } = resource;
    const resourceRoute = useResourceUrlGenerator(resource);
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const onClickDropdown = useCallback(
        (e) => {
            e.preventDefault();
            setDropdownOpened((opened) => !opened);
        },
        [setDropdownOpened],
    );

    const finalTypes =
        types !== null
            ? types.filter(({ settings: { canCreate = true } = {} }) => canCreate)
            : null;
    const hasMultipleTypes = finalTypes !== null && finalTypes.length > 1;

    const onDropdownClickOutside = useCallback(() => {
        setDropdownOpened(false);
    }, [setDropdownOpened]);

    const button = (
        <Button
            href={
                !hasMultipleTypes
                    ? `${resourceRoute('create')}${
                          finalTypes !== null && finalTypes.length === 1
                              ? `?type=${finalTypes[0].id}`
                              : ''
                      }`
                    : '#'
            }
            size="lg"
            theme="primary"
            className={classNames([
                {
                    'dropdown-toggle': hasMultipleTypes,
                    [className]: className !== null,
                },
            ])}
            onClick={hasMultipleTypes ? onClickDropdown : null}
        >
            <ResourceMessage
                resource={resource}
                id="resources.create_btn"
                defaultMessage="Create {a_singular}"
                description="Button label"
            />
        </Button>
    );

    return hasMultipleTypes ? (
        <div
            className={classNames([
                'dropdown',
                {
                    show: dropdownOpened,
                },
            ])}
        >
            {button}
            <Dropdown
                items={finalTypes.map((it) => ({
                    id: it.id,
                    label: it.name,
                    href: `${resourceRoute('create')}?type=${it.id}`,
                }))}
                visible={dropdownOpened}
                align="end"
                onClickOutside={onDropdownClickOutside}
            />
        </div>
    ) : (
        button
    );
};
ResourceCreateButtom.propTypes = propTypes;
ResourceCreateButtom.defaultProps = defaultProps;

export default ResourceCreateButtom;
