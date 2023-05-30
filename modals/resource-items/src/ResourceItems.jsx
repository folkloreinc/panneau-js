import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
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
    query,
    onPageChange,
    onQueryChange,
    onQueryReset,
    onClose,
    listProps,
    className,
    ...props
}) => {
    const resourceValues = useResourceValues(resource);
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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </Dialog>
    );
};

ModalResourceItems.propTypes = propTypes;
ModalResourceItems.defaultProps = defaultProps;

export default ModalResourceItems;
