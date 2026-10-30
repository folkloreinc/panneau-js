// TODO(panneau-5): `useUrlGenerator` of `@panneau/core/contexts`: Panneau 5 has no named routes: link to `{basePath}/resources/{resource}/{id}` (decision 0019), or run a resource action
import { useUrlGenerator } from '@panneau/core/contexts';
// TODO(panneau-5): the default export of `@panneau/element-button`: `Button` of `@panneau/ui` (`variant` and `tone` instead of `theme`, Lucide icons)
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
