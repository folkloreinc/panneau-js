/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import Autosuggest from 'react-autosuggest';
import { injectIntl } from 'react-intl';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';
import { getJSON } from '@panneau/core/requests';

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
    suggestions: null,
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

const AutosuggestField = props => {
    const {
        intl,
        label,
        name,
        value,
        placeholder,
        suggestions: propsSuggestions,
        suggestionsEndpoint,
        getSuggestionTitle,
        getSuggestionDescription,
        getSuggestionThumbnail,
        getSuggestionValue,
        suggestionTitlePath,
        suggestionDescriptionPath,
        suggestionThumbnailPath,
        suggestionValuePath,
        onChange,
        onSelect,
        ...other
    } = props;
    const [stateSuggestions, setStateSuggestions] = useState(propsSuggestions || []);
    const suggestions = propsSuggestions || stateSuggestions;

    const fetchSuggestions = useCallback(
        () =>
            getJSON(suggestionsEndpoint, {
                credentials: 'include',
            })
                .then(data => setStateSuggestions(data))
                .catch(() => setStateSuggestions([])),
        [suggestionsEndpoint],
    );

    useEffect(() => {
        if (suggestionsEndpoint !== null) {
            fetchSuggestions();
        }
    }, [suggestionsEndpoint, fetchSuggestions]);

    const onInputChange = useCallback(
        (e, { newValue }) => {
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    const onSuggestionSelected = useCallback(
        (event, { suggestion }) => {
            if (onSelect !== null) {
                onSelect(suggestion);
            }
        },
        [onSelect],
    );

    const onSuggestionsFetchRequested = useCallback(() => {
        if (suggestionsEndpoint !== null) {
            fetchSuggestions();
        }
    }, [suggestionsEndpoint]);

    const onSuggestionsClearRequested = useCallback(() => {
        setStateSuggestions([]);
    }, []);

    const theme = useMemo(
        () => ({
            container: styles.autosuggest,
            containerOpen: styles.open,
            input: classNames(['form-control', styles.input]),
            suggestionsContainer: styles.suggestionsContainer,
            suggestionsContainerOpen: styles.open,
            suggestionsList: styles.suggestions,
            suggestion: styles.suggestion,
            suggestionHighlighted: styles.highlighted,
        }),
        [styles],
    );

    const finalGetSuggestionValue = useCallback(
        suggestion => {
            return getSuggestionValue !== null
                ? getSuggestionValue(suggestion, props)
                : get(suggestion, suggestionValuePath, '');
        },
        [getSuggestionValue, suggestionValuePath],
    );

    const renderSuggestion = useCallback(
        suggestion => {
            const thumbnail =
                getSuggestionThumbnail !== null
                    ? getSuggestionThumbnail(suggestion, props)
                    : get(suggestion, suggestionThumbnailPath, null);
            const title =
                getSuggestionTitle !== null
                    ? getSuggestionTitle(suggestion, props)
                    : get(suggestion, suggestionTitlePath, null);
            const description =
                getSuggestionDescription !== null
                    ? getSuggestionDescription(suggestion, props)
                    : get(suggestion, suggestionDescriptionPath, null);
            return (
                <div className={styles.inner}>
                    <div className={styles.cols}>
                        {thumbnail !== null ? (
                            <div className={styles.col}>
                                <div
                                    className={styles.thumbnail}
                                    style={{
                                        backgroundImage: `url("${thumbnail}")`,
                                    }}
                                />
                            </div>
                        ) : null}
                        <div className={classNames([styles.col, styles.expand])}>
                            {title !== null ? <div className={styles.title}>{title}</div> : null}
                            {description !== null ? (
                                <div className={styles.description}>{description}</div>
                            ) : null}
                        </div>
                    </div>
                </div>
            );
        },
        [
            getSuggestionTitle,
            getSuggestionDescription,
            getSuggestionThumbnail,
            suggestionTitlePath,
            suggestionDescriptionPath,
            suggestionThumbnailPath,
        ],
    );

    return (
        <FormGroup className={styles.container} name={name} label={label} {...other}>
            <Autosuggest
                suggestions={suggestions}
                inputProps={{
                    value: value || '',
                    onChange: onInputChange,
                    placeholder: isMessage(placeholder)
                        ? intl.formatMessage(placeholder)
                        : placeholder || '',
                }}
                theme={theme}
                getSuggestionValue={finalGetSuggestionValue}
                renderSuggestion={renderSuggestion}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                onSuggestionSelected={onSuggestionSelected}
            />
        </FormGroup>
    );
};

AutosuggestField.propTypes = propTypes;
AutosuggestField.defaultProps = defaultProps;

export default injectIntl(AutosuggestField);
