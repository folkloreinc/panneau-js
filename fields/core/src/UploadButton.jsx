import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
    label: {
        id: 'core.buttons.upload',
        description: 'The label of the "upload" button',
        defaultMessage: 'Select a file',
    },
});

const propTypes = {
    endpoint: PropTypes.string.isRequired,
    inputName: PropTypes.string,
    accept: PropTypes.string,
    customHeaders: PropTypes.objectOf(PropTypes.string),
    onUploadStart: PropTypes.func,
    onUploadComplete: PropTypes.func,
    label: PanneauPropTypes.message,
};

const defaultProps = {
    inputName: 'file',
    accept: 'image/*',
    customHeaders: {},
    onUploadStart: null,
    onUploadComplete: null,
    label: messages.label,
};

class UploadButton extends Component {
    constructor(props) {
        super(props);

        this.onUploadStart = this.onUploadStart.bind(this);
        this.onUploadComplete = this.onUploadComplete.bind(this);

        this.FileInput = null;
        this.FineUploaderTraditional = null;
        this.uploader = null;

        this.state = {
            ready: false,
        };
    }

    componentDidMount() {
        import(/* webpackChunkName: "vendor/react-fine-uploader/file-input" */ 'react-fine-uploader/file-input')
            .then((dep) => {
                this.FileInput = dep.default;
                return import(/* webpackChunkName: "vendor/fine-uploader-wrappers" */ 'fine-uploader-wrappers');
            })
            .then((dep) => {
                this.FineUploaderTraditional = dep.default;
                this.uploader = this.createUploader();
                this.setState({
                    ready: true,
                });
            });
    }

    componentWillUnmount() {
        if (this.uploader !== null) {
            this.destroyUploader(this.uploader);
            this.uploader = null;
        }
    }

    onUploadStart() {
        const { onUploadStart } = this.props;
        if (onUploadStart !== null) {
            onUploadStart();
        }
    }

    onUploadComplete(id, name, response) {
        const { onUploadComplete } = this.props;
        if (onUploadComplete !== null) {
            onUploadComplete(response, id, name);
        }
    }

    createUploader() {
        const { FineUploaderTraditional } = this;
        const { endpoint, inputName, customHeaders } = this.props;
        const uploader = new FineUploaderTraditional({
            options: {
                request: {
                    endpoint,
                    inputName,
                    customHeaders,
                },
            },
        });
        uploader.on('upload', this.onUploadStart);
        uploader.on('complete', this.onUploadComplete);
        return uploader;
    }

    destroyUploader(uploader) {
        uploader.methods.cancelAll();
        uploader.off('upload', this.onUploadStart);
        uploader.off('complete', this.onUploadComplete);
    }

    render() {
        const { ready } = this.state;
        if (!ready) {
            return null;
        }

        const { FileInput } = this;
        const { accept, label } = this.props;

        return (
            <FileInput accept={accept} uploader={this.uploader}>
                <div>
                    <button
                        type="button"
                        className={classNames({
                            btn: true,
                            'btn-default': true,
                        })}
                        onClick={this.onClickSelect}
                    >
                        {isString(label) ? (
                            label
                        ) : (
                            <FormattedMessage {...label} />
                        )}
                    </button>
                </div>
            </FileInput>
        );
    }
}

UploadButton.propTypes = propTypes;
UploadButton.defaultProps = defaultProps;

export default UploadButton;
