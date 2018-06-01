import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import Autosuggest from 'react-autosuggest';
import { injectIntl } from 'react-intl';
import { FormGroup } from '@panneau/field';
import { getJSON, PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.scss';

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    placeholder: PanneauPropTypes.message,
    suggestions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    suggestionsEndpoint: PropTypes.string,
    suggestionValuePath: PropTypes.string,
    suggestionTitlePath: PropTypes.string,
    suggestionDescriptionPath: PropTypes.string,
    suggestionThumbnailPath: PropTypes.string,
    getSuggestionValue: PropTypes.func,
    getSuggestionTitle: PropTypes.func,
    getSuggestionDescription: PropTypes.func,
    getSuggestionThumbnail: PropTypes.func,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    placeholder: null,
    suggestions: [],
    suggestionsEndpoint: null,
    suggestionValuePath: 'name',
    suggestionTitlePath: 'name',
    suggestionDescriptionPath: 'description',
    suggestionThumbnailPath: 'thumbnail',
    getSuggestionValue: null,
    getSuggestionTitle: null,
    getSuggestionDescription: null,
    getSuggestionThumbnail: null,
    onChange: null,
    onSelect: null,
};

class ItemField extends Component {
    static parse(value) {
        return value;
    }

    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.onSuggestionsFetched = this.onSuggestionsFetched.bind(this);
        this.onSuggestionsFetchError = this.onSuggestionsFetchError.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.renderSuggestions = this.renderSuggestions.bind(this);

        this.state = {
            suggestions: props.suggestions || [],
        };
    }

    componentWillReceiveProps(nextProps) {
        const suggestionsChanged = nextProps.suggestions !== this.props.suggestions;
        if (suggestionsChanged) {
            this.setState({
                suggestions: nextProps.suggestions || [],
            });
        }
    }

    componentDidUpdate(prevProps) {
        const suggestionsEndpointChanged =
            prevProps.suggestionsEndpoint !== this.props.suggestionsEndpoint;
        if (suggestionsEndpointChanged && this.props.suggestionsEndpoint !== null) {
            this.fetchSuggestions();
        }
    }

    onInputChange(event, { newValue }) {
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    onSuggestionSelected(event, { suggestion }) {
        if (this.props.onSelect) {
            this.props.onSelect(suggestion);
        }
    }

    onSuggestionsFetchRequested() {
        const { suggestionsEndpoint, suggestions } = this.props;
        if (suggestionsEndpoint !== null) {
            this.fetchSuggestions();
        } else {
            this.setState({
                suggestions,
            });
        }
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: [],
        });
    }

    onSuggestionsFetched(data) {
        this.setState({
            suggestions: data,
        });
    }

    onSuggestionsFetchError() {
        this.setState({
            suggestions: [],
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getSuggestionValue(suggestion) {
        const { getSuggestionValue, suggestionValuePath } = this.props;
        return getSuggestionValue !== null
            ? getSuggestionValue(suggestion, this.props)
            : get(suggestion, suggestionValuePath, '');
    }

    fetchSuggestions() {
        const { suggestionsEndpoint } = this.props;
        getJSON(suggestionsEndpoint, {
            credentials: 'include',
        })
            .then(this.onSuggestionsFetched)
            .catch(this.onSuggestionsFetchError);
    }

    // eslint-disable-next-line class-methods-use-this
    renderSuggestions({ containerProps, children }) {
        return <div {...containerProps}>{children}</div>;
    }

    // eslint-disable-next-line class-methods-use-this
    renderSuggestion(suggestion) {
        const {
            getSuggestionTitle,
            getSuggestionDescription,
            getSuggestionThumbnail,
            suggestionTitlePath,
            suggestionDescriptionPath,
            suggestionThumbnailPath,
        } = this.props;
        const thumbnail =
            getSuggestionThumbnail !== null
                ? getSuggestionThumbnail(suggestion)
                : get(suggestion, suggestionThumbnailPath, null);
        const title =
            getSuggestionTitle !== null
                ? getSuggestionTitle(suggestion)
                : get(suggestion, suggestionTitlePath, null);
        const description =
            getSuggestionDescription !== null
                ? getSuggestionDescription(suggestion)
                : get(suggestion, suggestionDescriptionPath, null);
        const labelClassNames = classNames({
            [styles.col]: true,
            [styles.expand]: true,
        });
        const thumbnailStyle =
            thumbnail !== null
                ? {
                    backgroundImage: `url(${thumbnail})`,
                }
                : null;
        return (
            <div className={styles.inner}>
                <div className={styles.cols}>
                    {thumbnail ? (
                        <div className={styles.col}>
                            <div className={styles.thumbnail} style={thumbnailStyle} />
                        </div>
                    ) : null}
                    <div className={labelClassNames}>
                        {title !== null ? <div className={styles.title}>{title}</div> : null}
                        {description !== null ? (
                            <div className={styles.description}>{description}</div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    renderInput() {
        const { value, placeholder, intl } = this.props;
        const { suggestions } = this.state;
        const inputPlaceholder = placeholder || '';
        const inputProps = {
            value: value || '',
            onChange: this.onInputChange,
            placeholder: isObject(inputPlaceholder)
                ? intl.formatMessage(inputPlaceholder)
                : inputPlaceholder,
        };
        const theme = {
            container: classNames({
                [styles.autosuggest]: true,
            }),
            containerOpen: classNames({
                [styles.open]: true,
            }),
            input: classNames({
                'form-control': true,
                [styles.input]: true,
            }),
            suggestionsContainer: classNames({
                [styles.suggestionsContainer]: true,
            }),
            suggestionsContainerOpen: classNames({
                [styles.open]: true,
            }),
            suggestionsList: classNames({
                [styles.suggestions]: true,
            }),
            suggestion: classNames({
                [styles.suggestion]: true,
            }),
            suggestionHighlighted: classNames({
                [styles.highlighted]: true,
            }),
        };
        return (
            <Autosuggest
                suggestions={suggestions}
                inputProps={inputProps}
                theme={theme}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
            />
        );
    }

    render() {
        const {
            label, name, value, ...other
        } = this.props;

        return (
            <FormGroup
                className={classNames({
                    [styles.container]: true,
                })}
                name={name}
                label={label}
                {...other}
            >
                {this.renderInput()}
            </FormGroup>
        );
    }
}

ItemField.propTypes = propTypes;
ItemField.defaultProps = defaultProps;

export default injectIntl(ItemField);
