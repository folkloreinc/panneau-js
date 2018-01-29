import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';

import containerClassNames from './styles.scss';
import partialClassNames from './styles.scss';

const propTypes = {
    media: PropTypes.shape({
        name: PropTypes.string,
    }).isRequired,
    vertical: PropTypes.bool,
    selectable: PropTypes.bool,
    className: PropTypes.string,
    renderDetails: PropTypes.func,
    getThumbnail: PropTypes.func,
    getIcon: PropTypes.func,
    loadTimeout: PropTypes.number,
    onClickDelete: PropTypes.func,
    onClickSelect: PropTypes.func,
    onLoad: PropTypes.func,
};

const defaultProps = {
    selectable: false,
    vertical: false,
    className: null,
    renderDetails: null,
    getThumbnail: null,
    getIcon: null,
    loadTimeout: 0,
    onClickDelete: null,
    onClickSelect: null,
    onLoad: null,
};

const loadedMedias = {};

class Media extends Component {
    static isLoaded(src) {
        return typeof Media.loadedMedias[src] !== 'undefined' && Media.loadedMedias[src] === true;
    }

    static addLoaded(src) {
        Media.loadedMedias[src] = true;
    }

    constructor(props) {
        super(props);

        this.thumbnail = null;
        this.loadTimeout = null;

        this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    }

    componentDidMount() {
        const {
            media,
            getThumbnail,
            onLoad,
            loadTimeout,
        } = this.props;
        const thumbnail = getThumbnail ? getThumbnail(media) : null;
        if (thumbnail && !Media.isLoaded(thumbnail)) {
            this.thumbnail = document.createElement('img');
            this.thumbnail.addEventListener('load', this.onThumbnailLoad);
            this.thumbnail.src = thumbnail;
        } else if (onLoad !== null) {
            this.loadTimeout = setTimeout(() => {
                onLoad();
                this.loadTimeout = null;
            }, loadTimeout);
        }
    }

    componentWillUnmount() {
        if (this.thumbnail) {
            this.thumbnail.removeEventListener('load', this.onThumbnailLoad);
            this.thumbnail = null;
        }
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }
    }

    onThumbnailLoad() {
        const {
            media,
            getThumbnail,
            onLoad,
        } = this.props;

        Media.addLoaded(getThumbnail(media));

        if (onLoad) {
            onLoad();
        }
    }

    render() {
        const {
            media,
            vertical,
            selectable,
            className,
            renderDetails,
            getThumbnail,
            getIcon,
            onClickDelete,
            onClickSelect,
        } = this.props;
        const thumbnail = getThumbnail ? getThumbnail(media) : null;
        const icon = getIcon ? getIcon(media) : null;

        const fieldClassNames = classNames({
            [partialClassNames.container]: true,
            [partialClassNames.vertical]: vertical,
            [className]: className !== null,
        });

        const containerClassName = classNames({
            [containerClassNames.table]: !vertical,
            [containerClassNames.fullWidth]: true,
        });

        const thumbnailClassNames = classNames({
            [containerClassNames.cell]: !vertical,
            [containerClassNames.middle]: !vertical,
            [partialClassNames.thumbnail]: true,
        });

        const labelClassNames = classNames({
            [containerClassNames.cell]: !vertical,
            [containerClassNames.middle]: !vertical,
        });

        const labelContainerClassNames = classNames({
            [containerClassNames.table]: true,
            [containerClassNames.fullWidth]: true,
        });

        const detailsClassNames = classNames({
            [containerClassNames.cell]: true,
            [containerClassNames.middle]: true,
            [partialClassNames.details]: true,
        });

        const actionsClassNames = classNames({
            [containerClassNames.cell]: true,
            [containerClassNames.middle]: true,
            [partialClassNames.actions]: true,
        });

        return (
            <div
                className={fieldClassNames}
            >
                <div className={containerClassName}>
                    { thumbnail ? (
                        <div
                            className={thumbnailClassNames}
                            style={{
                                backgroundImage: `url("${thumbnail}")`,
                            }}
                        />
                    ) : icon }
                    <div className={labelClassNames}>
                        <div className={labelContainerClassNames}>
                            <div className={detailsClassNames}>
                                { renderDetails ? renderDetails(media, (
                                    <div className={partialClassNames.commons}>
                                        <h4 className={partialClassNames.name}>{ media.name }</h4>
                                        <div className={partialClassNames.date}>
                                            { moment(media.created_at, 'YYYY-MM-DD HH::mm:ss').format('D MMM YYYY, H:mm') }
                                        </div>
                                    </div>
                                )) : null }
                            </div>
                            <div className={actionsClassNames}>
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-default"
                                        onClick={onClickDelete}
                                    >
                                        <span className="fa fa-trash" />
                                    </button>
                                    { selectable ? (
                                        <button
                                            type="button"
                                            className="btn btn-default"
                                            onClick={onClickSelect}
                                        >
                                            <span className="fa fa-plus" />
                                        </button>
                                    ) : null }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Media.loadedMedias = loadedMedias;
Media.propTypes = propTypes;
Media.defaultProps = defaultProps;

export default Media;
