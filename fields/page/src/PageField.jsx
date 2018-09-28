import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes, withUrlGenerator } from '@panneau/core';
import ItemField from '@panneau/field-item';

const messages = defineMessages({
    placeholder: {
        id: 'fields.page.placeholder',
        description: 'Placeholder of the page autosuggest input',
        defaultMessage: 'Search for a page...',
    },
});

const propTypes = {
    urlGenerator: PanneauPropTypes.urlGenerator,
    placeholder: PanneauPropTypes.message,
    resourceId: PropTypes.string,
    endpoint: PropTypes.string,
};

const defaultProps = {
    urlGenerator: null,
    placeholder: messages.placeholder,
    resourceId: 'pages',
    endpoint: null,
};

const contextTypes = {
    definition: PanneauPropTypes.definition,
};

class PageField extends PureComponent {
    getEndpoint() {
        const { resourceId, urlGenerator, endpoint } = this.props;
        const { definition } = this.context;
        if (endpoint !== null) {
            return endpoint;
        }
        if (urlGenerator === null || definition === null) {
            return null;
        }
        const resources = definition.resources || [];
        const resource = resources.find(it => it.id === resourceId) || null;
        if (resource === null) {
            return null;
        }
        return urlGenerator.route(
            typeof resource.routes !== 'undefined'
                ? `resources.${resources.id}.index`
                : 'resources.index',
            {
                resource: resource.id,
            },
        );
    }

    render() {
        return (
            <ItemField
                cardItemMap={{
                    name: 'title',
                    created_at: 'created_at',
                    thumbnail: 'image',
                }}
                autosuggestProps={{
                    suggestionsEndpoint: this.getEndpoint(),
                    suggestionValuePath: 'title',
                    suggestionTitlePath: 'title',
                }}
                {...this.props}
            />
        );
    }
}

PageField.propTypes = propTypes;
PageField.defaultProps = defaultProps;
PageField.contextTypes = contextTypes;

export default withUrlGenerator()(PageField);
