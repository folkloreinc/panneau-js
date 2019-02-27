import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes, withUrlGenerator, withDefinition } from '@panneau/core';
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
    definition: PanneauPropTypes.definition,
    placeholder: PanneauPropTypes.message,
    resourceId: PropTypes.string,
    endpoint: PropTypes.string,
};

const defaultProps = {
    urlGenerator: null,
    definition: null,
    placeholder: messages.placeholder,
    resourceId: 'pages',
    endpoint: null,
};

class PageField extends PureComponent {
    getEndpoint() {
        const {
            resourceId, urlGenerator, definition, endpoint,
        } = this.props;
        if (endpoint !== null) {
            return endpoint;
        }
        if (urlGenerator === null || definition === null) {
            return null;
        }
        const { resources = [] } = definition;
        const resource = resources.find(it => it.id === resourceId) || null;
        if (resource === null) {
            return null;
        }
        return urlGenerator.route(
            typeof resource.routes !== 'undefined'
                ? `resources.${resource.id}.index`
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

const WithUrlGeneratorContainer = withUrlGenerator()(PageField);
const WithDefinitionContainer = withDefinition()(WithUrlGeneratorContainer);
export default WithDefinitionContainer;
