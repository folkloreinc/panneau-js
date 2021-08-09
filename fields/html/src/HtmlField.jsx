/* eslint-disable react/jsx-props-no-spreading */
import InputGroup from '@panneau/field-input-group';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import useCKEditor from './hooks/useCKEditor';
import useCKEditorBuild from './hooks/useCKEditorBuild';
import useQuill from './hooks/useQuill';
import './styles.global.scss';

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
    ckOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    quillOptions: PropTypes.shape({
        modules: PropTypes.shape({
            toolbar: PropTypes.arrayOf([PropTypes.array, PropTypes.string]),
        }),
        formats: PropTypes.arrayOf(PropTypes.string),
    }),
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
    ckOptions: null,
    quillOptions: {
        formats: ['bold', 'italic', 'link', 'underline', 'header', 'indent', 'list']
    },
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
    quillOptions,
    ckOptions,
    className,
}) => {
    const usingCKeditor = type === 'ck-editor';
    const CKEditor = useCKEditor({ disabled: !usingCKeditor });
    const CKEditorBuild = useCKEditorBuild({ disabled: !usingCKeditor, inline });
    const Quill = useQuill({ disabled: usingCKeditor, inline });
    const CKValue = value !== null ? value : '';

    const finalClassName = inline
        ? classNames([
              'form-control',
              {
                  [className]: className !== null,
                  'is-valid': feedback === 'valid',
                  'is-invalid': feedback === 'invalid' || (errors !== null && errors.length > 0),
              },
          ])
        : className;

    const onCkEditorChange = useCallback(
        (event, editor) => {
            const data = editor.getData();
            if (onChange !== null) {
                onChange(data === '' ? null : data);
            }
        },
        [onChange],
    );

    const onQuillChange = useCallback(
        (newValue, delta, source) => {
            if (onChange !== null && source === 'user') {
                onChange(newValue === '<p><br></p>' ? null : newValue);
            }
        },
        [onChange],
    );

    const commonProps = {
        onFocus,
        onBlur,
    };

    const ckElement =
        CKEditor !== null && CKEditorBuild !== null ? (
            <div className={finalClassName}>
                <CKEditor
                    editor={CKEditorBuild}
                    data={CKValue}
                    config={{ placeholder }}
                    onChange={onCkEditorChange}
                    {...commonProps}
                    {...ckOptions}
                />
            </div>
        ) : null;

    const quillElement =
        Quill !== null ? (
            <Quill
                className={finalClassName}
                value={value}
                theme={inline ? 'bubble' : 'snow'}
                onChange={onQuillChange}
                placeholder={placeholder}
                defaultValue={null}
                {...commonProps}
                {...quillOptions}
            />
        ) : null;

    const element = usingCKeditor ? ckElement : quillElement;

    return inline ? <InputGroup>{element}</InputGroup> : element;
};

HtmlField.propTypes = propTypes;
HtmlField.defaultProps = defaultProps;

export default HtmlField;
