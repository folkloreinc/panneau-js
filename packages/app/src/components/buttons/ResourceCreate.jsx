import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import ResourceLabel from '../partials/ResourceLabel';

import messages from '../messages';

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
            setDropdownOpened(!dropdownOpened);
        },
        [dropdownOpened, setDropdownOpened],
    );
    const button = (
        <Button
            href={types === null ? resourceRoute('create') : '#'}
            size="lg"
            theme="primary"
            className={classNames([
                {
                    'dropdown-toggle': types !== null,
                    [className]: className !== null,
                },
            ])}
            onClick={types !== null ? onClickDropdown : null}
        >
            <ResourceLabel resource={resource} message={messages.create} />
        </Button>
    );
    return types !== null ? (
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
                items={types
                    .filter(({ meta: { can_create: canCreate = true } = {} }) => canCreate)
                    .map((it) => ({
                        id: it.id,
                        label: it.name,
                        href: `${resourceRoute('create')}?type=${it.id}`,
                    }))}
                visible={dropdownOpened}
                align="right"
            />
        </div>
    ) : (
        button
    );
};
ResourceCreateButtom.propTypes = propTypes;
ResourceCreateButtom.defaultProps = defaultProps;

export default ResourceCreateButtom;
