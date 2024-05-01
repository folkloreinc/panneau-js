/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useQuery } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';
import ResourceItemsList from '@panneau/list-resource-items';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    resource: PropTypes.string,
    title: PropTypes.string,
    query: PropTypes.shape(),
    paginated: PropTypes.bool,
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    onClose: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    listProps: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    resource: null,
    title: null,
    query: null,
    paginated: true,
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    onClose: null,
    listProps: null,
    className: null,
    children: null,
};

const ModalResourceItems = ({
    id,
    resource,
    title,
    query: initialQuery,
    paginated,
    onClose,
    listProps,
    className,
    children,
    ...props
}) => {
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
            size="lg"
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
};

ModalResourceItems.propTypes = propTypes;
ModalResourceItems.defaultProps = defaultProps;

export default ModalResourceItems;
