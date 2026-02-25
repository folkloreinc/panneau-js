import classNames from 'classnames';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useResourceUrlGenerator } from '@panneau/core/hooks';
import type { ButtonSize, Resource } from '@panneau/core';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import { useResourceValues } from '@panneau/intl';

interface ResourceCreateButtonProps {
    resource: Resource;
    size?: ButtonSize;
    className?: string | null;
}

function ResourceCreateButton({
    resource,
    size = 'lg',
    className = null,
}: ResourceCreateButtonProps) {
    const { types = null } = resource;
    const resourceRoute = useResourceUrlGenerator(resource);
    const resourceValues = useResourceValues(resource);

    const [dropdownOpened, setDropdownOpened] = useState(false);
    const onClickDropdown = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpened(!dropdownOpened);
        },
        [setDropdownOpened, dropdownOpened],
    );

    const finalTypes =
        types !== null
            ? types.filter(({ settings: { canCreate = true } = {} }) => canCreate)
            : null;
    const hasMultipleTypes = finalTypes !== null && finalTypes.length > 1;

    const onDropdownClickOutside = useCallback(() => {
        if (dropdownOpened) {
            setDropdownOpened(false);
        }
    }, [setDropdownOpened, dropdownOpened]);

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
            size={size}
            theme="primary"
            className={classNames([
                {
                    'dropdown-toggle': hasMultipleTypes,
                    [className]: className !== null,
                },
            ])}
            onClick={hasMultipleTypes ? onClickDropdown : null}
        >
            <FormattedMessage
                values={resourceValues}
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
}

export default ResourceCreateButton;
