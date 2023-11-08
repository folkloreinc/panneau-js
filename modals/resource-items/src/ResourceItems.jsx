/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useResourceQuery } from '@panneau/core/hooks';
import { useResourceValues } from '@panneau/intl';
import ResourceItemsList from '@panneau/list-resource-items';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    resource: PropTypes.string,
    title: PropTypes.string,
    query: PropTypes.shape(),
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    onClose: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    listProps: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    resource: null,
    title: null,
    query: null,
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    onClose: null,
    listProps: null,
    className: null,
};

const ModalResourceItems = ({
    resource,
    title,
    query: initialQuery,
    onClose,
    listProps,
    className,
    ...props
}) => {
    const resourceValues = useResourceValues(resource);
    const finalQuery = useMemo(() => ({ ...initialQuery }), [initialQuery]);
    const { query, onPageChange, onQueryChange, onQueryReset } = useResourceQuery(finalQuery);

    // TODO: add default list props?

    return (
        <Dialog
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
        </Dialog>
    );
};

ModalResourceItems.propTypes = propTypes;
ModalResourceItems.defaultProps = defaultProps;

export default ModalResourceItems;
