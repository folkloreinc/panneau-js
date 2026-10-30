import { useUrlGenerator } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import { postJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import React from 'react';

function PublishAction({ value, reload }) {
    const route = useUrlGenerator();
    const { id = null } = value || {};
    return (
        <Button
            theme="primary"
            icon="check"
            onClick={() => postJSON(route('resources.articles.publish', { id })).then(reload)}
        >
            Publish
        </Button>
    );
}

PublishAction.propTypes = {
    value: PropTypes.shape({ id: PropTypes.string }),
    reload: PropTypes.func,
};

PublishAction.defaultProps = {
    value: null,
    reload: null,
};

export default PublishAction;
