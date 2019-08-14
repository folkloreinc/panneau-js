import React, { Component } from 'react';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import ItemsField from '@panneau/field-items';

const propTypes = {
    value: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    FieldComponent: PropTypes.elementType.isRequired,
};

const defaultProps = {
    value: null,
    onChange: null,
};

class MediasField extends Component {
    constructor(props) {
        super(props);

        this.renderItemField = this.renderItemField.bind(this);
        this.getNewItemValue = this.getNewItemValue.bind(this);
    }

    onItemChange(index, value) {
        const { value: currentValue } = this.props;
        const newValue = {
            ...currentValue[index],
            ...value,
        };
        const newItems = [].concat(currentValue);
        newItems[index] = newValue;
        this.triggerChange(newItems);
    }

    // eslint-disable-next-line class-methods-use-this
    getNewItemValue() {
        return null;
    }

    triggerChange(newValue) {
        const { value, onChange } = this.props;
        const currentValue = value || [];
        if (currentValue !== newValue && onChange !== null) {
            onChange(newValue);
        }
    }

    renderItemField(it, index, { value }) {
        const { FieldComponent } = this.props;
        const itemValue = !isObject(value) || Object.keys(value).length > 0 ? value : null;

        return (
            <FieldComponent
                value={itemValue}
                inputOnly
                withoutMargin
                cardWithoutBorder
                deletable={false}
                onChange={val => this.onItemChange(index, val)}
            />
        );
    }

    render() {
        return (
            <ItemsField
                renderItemField={this.renderItemField}
                getNewItemValue={this.getNewItemValue}
                withoutPanel
                withoutHeader
                {...this.props}
            />
        );
    }
}

MediasField.propTypes = propTypes;
MediasField.defaultProps = defaultProps;

export default MediasField;
