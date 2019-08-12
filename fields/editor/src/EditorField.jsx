import React, { useCallback, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import isString from 'lodash/isString';
import { FormGroup } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/**
 *  Class: EditorField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
const propTypes = {
    name: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.node, PanneauPropTypes.message]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    disabled: PropTypes.bool,
    removePlugins: PropTypes.arrayOf(PropTypes.string),
    toolbar: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    toolbars: PropTypes.objectOf(PropTypes.array),
    editorConfig: PropTypes.object, // eslint-disable-line
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onReady: PropTypes.func,
};

const defaultProps = {
    name: null,
    label: null,
    value: null,
    errors: null,
    disabled: false,
    removePlugins: null,
    toolbar: 'basic',
    toolbars: {
        basic: [
            'bold',
            'italic',
            '|',
            'link',
            '|',
            'blockQuote',
            '|',
            'bulletedList',
            'numberedList',
        ],
    },
    editorConfig: {},
    onChange: null,
    onFocus: null,
    onBlur: null,
    onReady: null,
};

const EditorField = ({
    name,
    value,
    disabled,
    removePlugins,
    toolbar,
    toolbars,
    editorConfig: customEditorConfig,
    onReady,
    onChange,
    onBlur,
    onFocus,
    ...props
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const refEditor = useRef(null);

    const editorConfig = useMemo(() => {
        const propsConfig = {};
        if (removePlugins !== null) {
            propsConfig.removePlugins = removePlugins;
        }
        const finalToolbar = (isString(toolbar) ? toolbars[toolbar] : toolbar) || null;
        if (finalToolbar !== null) {
            propsConfig.toolbar = finalToolbar;
        }
        return {
            ...propsConfig,
            ...customEditorConfig,
        };
    }, [removePlugins, toolbar, toolbars, customEditorConfig]);

    const onEditorOnReady = useCallback(
        editor => {
            refEditor.current = editor;
            if (onReady !== null) {
                onReady(editor);
            }
        },
        [onReady],
    );

    const onEditorChange = useCallback(
        (e, editor) => {
            const newValue = editor.getData();
            setInputValue(newValue);
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    return (
        <FormGroup className="form-group-editor" {...props}>
            <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={value || ''}
                disabled={disabled}
                onInit={onEditorOnReady}
                onChange={onEditorChange}
                onBlur={onBlur}
                onFocus={onFocus}
            />
            <input type="hidden" name={name} value={inputValue} />
        </FormGroup>
    );
};

EditorField.propTypes = propTypes;
EditorField.defaultProps = defaultProps;

export default EditorField;
