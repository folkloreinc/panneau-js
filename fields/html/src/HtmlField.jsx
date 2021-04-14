/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import InputGroup from '@panneau/field-input-group';

import useCKEditor from './hooks/useCKEditor';
import useCKEditorBuild from './hooks/useCKEditorBuild';
import useQuill from './hooks/useQuill';

import styles from './styles.module.scss';

const propTypes = {
    feedback: PropTypes.oneOf(['valid', 'invalid', 'loading']),
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),

    value: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.oneOf([null, 'quill', 'ck-editor']),
    inline: PropTypes.bool,

    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    className: PropTypes.string,
};

const defaultProps = {
    feedback: null,
    errors: null,

    value: null,
    placeholder: null,
    type: null,
    inline: false,
    
    onChange: null,
    onFocus: null,
    onBlur: null,

    className: null,
};

const HtmlField = ({
    feedback,
    errors,

    value,
    placeholder,
    type,
    inline,
    
    onChange,
    onFocus,
    onBlur,

    className,
}) => {
    const usingCKeditor = type === 'ck-editor';
    const CKEditor = useCKEditor({ disabled: !usingCKeditor });
    const CKEditorBuild = useCKEditorBuild({ disabled: !usingCKeditor, inline });
    const Quill = useQuill({ disabled: usingCKeditor, inline });
    const finalValue = value !== null ? value : '';

    const finalClassName = inline
        ? classNames([
              styles.container,
              'form-control',
              {
                  [className]: className !== null,
                  'is-valid': feedback === 'valid',
                  'is-invalid': feedback === 'invalid' && errors !== null && errors.length > 0,
              },
          ])
        : className;

    const onCkEditorChange = useCallback(
        (event, editor) => {
            const data = editor.getData();
            if (onChange !== null) {
                onChange(data);
            }
        },
        [onChange],
    );

    const commonProps = {
        onFocus,
        onBlur,
    }

    const ckElement =
        CKEditor !== null && CKEditorBuild !== null ? (
            <div className={finalClassName}>
                <CKEditor
                    editor={CKEditorBuild}
                    data={finalValue}
                    config={{ placeholder }}
                    onChange={onCkEditorChange}
                    {...commonProps}
                />
            </div>
        ) : null;

    const quillElement =
        Quill !== null ? (
            <Quill
                className={finalClassName}
                value={finalValue}
                theme={inline ? 'bubble' : 'snow'}
                onChange={onChange}
                placeholder={placeholder}
                {...commonProps}
            />
        ) : null;

    const element = usingCKeditor ? ckElement : quillElement;

    return inline ? <InputGroup>{element}</InputGroup> : element;
};

HtmlField.propTypes = propTypes;
HtmlField.defaultProps = defaultProps;

export default HtmlField;
