import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import { FormGroup, Card } from '@panneau/field';
import AutosuggestField from '@panneau/field-autosuggest';

import styles from './styles.scss';

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    suggestions: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    autosuggestProps: PropTypes.shape({
        ...AutosuggestField.propTypes,
    }),
    cardProps: PropTypes.shape({
        ...Card.propTypes,
    }),
    cardVertical: PropTypes.bool,
    cardItemMap: PropTypes.shape({}),
    cardWithoutBorder: PropTypes.bool,
    getCardItemValue: PropTypes.func,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    suggestions: null,
    placeholder: '',
    autosuggestProps: null,
    cardProps: null,
    cardVertical: false,
    cardItemMap: null,
    cardWithoutBorder: false,
    getCardItemValue: null,
    onChange: null,
};

class ItemField extends Component {
    static parse(value) {
        return value;
    }

    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);

        this.state = {
            inputValue: '',
        };
    }

    onInputChange(newValue) {
        this.setState({
            inputValue: newValue,
        });
    }

    onSuggestionSelected(suggestion) {
        if (this.props.onChange) {
            this.props.onChange(suggestion);
        }
        this.setState({
            inputValue: '',
        });
    }

    onClickDelete() {
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    getCardItemFromValue(value) {
        const { getCardItemValue } = this.props;
        return getCardItemValue !== null ? getCardItemValue(value) : this.getCardItemFromMap(value);
    }

    getCardItemFromMap(value) {
        const { cardItemMap } = this.props;
        const mapToItem = (val, map) =>
            Object.keys(map).reduce(
                (cardItem, key) => ({
                    ...cardItem,
                    [key]: isObject(map[key]) ? mapToItem(val, map[key]) : get(val, map[key], null),
                }),
                {},
            );
        return cardItemMap !== null ? mapToItem(value, cardItemMap) : value;
    }

    renderAutosuggest() {
        const { autosuggestProps, placeholder, suggestions } = this.props;
        const { inputValue } = this.state;
        return (
            <AutosuggestField
                placeholder={placeholder}
                suggestions={suggestions}
                {...autosuggestProps}
                value={inputValue}
                onChange={this.onInputChange}
                onSelect={this.onSuggestionSelected}
            />
        );
    }

    renderSelect() {
        return <div className={styles.select}>{this.renderAutosuggest()}</div>;
    }

    renderCard() {
        const {
            value, cardVertical, cardProps, cardWithoutBorder,
        } = this.props;
        const item = this.getCardItemFromValue(value);
        return (
            <div className={styles.card}>
                <Card
                    vertical={cardVertical}
                    withoutBorder={cardWithoutBorder}
                    {...cardProps}
                    item={item}
                    onClickDelete={this.onClickDelete}
                />
            </div>
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
                {value !== null ? this.renderCard() : this.renderSelect()}
            </FormGroup>
        );
    }
}

ItemField.propTypes = propTypes;
ItemField.defaultProps = defaultProps;

export default ItemField;
