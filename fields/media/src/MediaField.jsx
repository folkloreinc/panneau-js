import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Immutable from 'immutable';
// import { withRouter } from 'react-router';
// import { connect } from 'react-redux';
// import isEmpty from 'lodash/isEmpty';

import FormGroup from '@panneau/form-group';

// import getStoryFromEditor from '../../../lib/getStoryFromEditor';
//
// import {
//     updateMedia as updateMediaActions,
// } from '../../../actions/EditorActions';
//
// import {
//     openModal as openModalActions,
//     closeModal as closeModalActions,
// } from '../../../actions/ModalsActions';

import fieldClassNames from './styles.scss';

const PENDING_VALUE = '@PENDING@';

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    type: PropTypes.string,
    vertical: PropTypes.bool,
    inputOnly: PropTypes.bool,
    selectButtonLabel: PropTypes.string,
    onChange: PropTypes.func,
    valueType: PropTypes.string,
    MediaComponent: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]).isRequired,
    updateMedia: PropTypes.func.isRequired,
    openBrowser: PropTypes.func.isRequired,
    closeBrowser: PropTypes.func.isRequired,
};

const defaultProps = {
    name: null,
    label: null,
    value: '',
    vertical: false,
    inputOnly: false,
    onChange: null,
    type: null,
    valueType: 'path',
    MediaComponent: null,
    selectButtonLabel: 'Sélectionnez un média...',
};


class MediaField extends Component {
    constructor(props) {
        super(props);

        this.onClickSelect = this.onClickSelect.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.onSelectMedia = this.onSelectMedia.bind(this);

        this.state = {
            pendingId: null,
        };
    }

    componentWillReceiveProps(nextProps) {
        const valueChanged = (
            nextProps.value !== this.props.value
        );
        if (valueChanged && nextProps.value !== PENDING_VALUE && this.state.pendingId) {
            this.setState({
                pendingId: null,
            });
        }
    }

    componentDidUpdate(prevProps) {
        const valueChanged = (
            prevProps.value !== this.props.value
        );
        if (valueChanged && this.props.value === PENDING_VALUE && this.state.pendingId) {
            this.props.onChange(this.state.pendingId);
        }
    }

    onClickDelete() {
        if (this.props.onChange) {
            this.props.onChange(null);
        }
    }

    onClickSelect() {
        this.props.openBrowser({
            type: this.props.type,
            onSelect: this.onSelectMedia,
        });
    }

    onSelectMedia(media) {
        const { valueType } = this.props;
        this.props.closeBrowser();

        if (valueType === 'path') {
            const id = this.props.updateMedia(media);

            this.setState({
                pendingId: id,
            }, () => {
                if (this.props.onChange) {
                    this.props.onChange(PENDING_VALUE);
                }
            });
            return;
        }

        if (this.props.onChange) {
            this.props.onChange(media);
        }
    }

    renderButton() {
        const {
            selectButtonLabel,
        } = this.props;
        return (
            <div className="form-group form-group-button">
                <button
                    type="button"
                    className="btn btn-default"
                    onClick={this.onClickSelect}
                >
                    { selectButtonLabel }
                </button>
            </div>
        );
    }

    renderInput() {
        const {
            value,
            vertical,
            MediaComponent, // Could create a bug watchout
        } = this.props;
        // const InputMediaComponent = this.props.MediaComponent;
        return (
            <div className={fieldClassNames.media}>
                <MediaComponent
                    vertical={vertical}
                    media={value}
                    onClickDelete={this.onClickDelete}
                />
            </div>
        );
    }

    render() {
        const {
            name,
            value,
            label,
            inputOnly,
            ...other
        } = this.props;

        const input = !value || value === PENDING_VALUE ?
            this.renderButton() : this.renderInput();

        if (inputOnly) {
            return input;
        }

        return (
            <FormGroup
                className={fieldClassNames.field}
                name={name}
                label={label}
                {...other}
            >
                { input }
            </FormGroup>
        );
    }
}

MediaField.propTypes = propTypes;
MediaField.defaultProps = defaultProps;

export default MediaField;

// const mapStateToProps = (state, ownProps) => {
//     let value;
//     const valueType = ownProps.valueType || 'path';
//     if (valueType === 'path') {
//         const story = getStoryFromEditor({
//             editor: state.editor,
//             stories: state.stories,
//             params: ownProps.params,
//         });
//         const medias = (story.get('medias', null) || new Immutable.Map()).toJS();
//         value = !isEmpty(ownProps.value) && ownProps.value !== PENDING_VALUE ?
//             (medias[ownProps.value] || null) : ownProps.value;
//     } else {
//         value = ownProps.value;
//     }
//     return {
//         modals: state.modals,
//         editor: state.editor,
//         stories: state.stories,
//         value,
//     };
// };
// const mapDispatchToProps = (dispatch, ownProps) => ({
//     updateMedia: (media) => {
//         const id = `media://${ownProps.type}/${media.id}`;
//         dispatch(updateMediaActions(id, media));
//         return id;
//     },
//     openBrowser: (modalProps) => {
//         dispatch(openModalActions('MediasBrowser', {
//             selectable: true,
//             ...modalProps,
//         }));
//     },
//     closeBrowser: () => {
//         dispatch(closeModalActions('MediasBrowser'));
//     },
// });
//
// // Redux Container
// const WithStoreContainer = connect(mapStateToProps, mapDispatchToProps)(MediaField);
// const WithRouterContainer = withRouter(WithStoreContainer);
// WithRouterContainer.Component = MediaField;
//
// export default WithRouterContainer;
