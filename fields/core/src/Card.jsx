import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import get from 'lodash/get';

import styles from './styles/card.scss';

const propTypes = {
    item: PropTypes.shape({
        name: PropTypes.string,
        created_at: PropTypes.string,
    }).isRequired,
    thumbnail: PropTypes.string,
    vertical: PropTypes.bool,
    deletable: PropTypes.bool,
    selectable: PropTypes.bool,
    className: PropTypes.string,
    renderLabel: PropTypes.func,
    namePath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    detailsPath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    datePath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    thumbnailPath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    iconPath: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    getName: PropTypes.func,
    getDetails: PropTypes.func,
    getThumbnail: PropTypes.func,
    getIcon: PropTypes.func,
    getDate: PropTypes.func,
    loadTimeout: PropTypes.number,
    onClickDelete: PropTypes.func,
    onClickSelect: PropTypes.func,
    onLoad: PropTypes.func,
};

const defaultProps = {
    thumbnail: null,
    deletable: true,
    selectable: false,
    vertical: false,
    className: null,
    renderLabel: null,
    namePath: 'name',
    detailsPath: 'details',
    datePath: 'created_at',
    thumbnailPath: 'thumbnail',
    iconPath: 'icon',
    getName: (item, { namePath }) => get(item, namePath, null),
    getDetails: (item, { detailsPath }) => get(item, detailsPath, null),
    getThumbnail: (item, { thumbnailPath }) => get(item, thumbnailPath, null),
    getIcon: (item, { iconPath }) => get(item, iconPath, null),
    getDate: (item, { datePath }) => {
        const date = get(item, datePath, null);
        return date !== null
            ? moment(date, 'YYYY-MM-DD HH::mm:ss').format('D MMM YYYY, H:mm')
            : null;
    },
    loadTimeout: 0,
    onClickDelete: null,
    onClickSelect: null,
    onLoad: null,
};

const loadedThumbnails = {};

class Card extends Component {
    static isLoaded(src) {
        return (
            typeof Card.loadedThumbnails[src] !== 'undefined' && Card.loadedThumbnails[src] === true
        );
    }

    static addLoaded(src) {
        Card.loadedThumbnails[src] = true;
    }

    constructor(props) {
        super(props);

        this.thumbnail = null;
        this.loadTimeout = null;

        this.onThumbnailLoad = this.onThumbnailLoad.bind(this);
    }

    componentDidMount() {
        const {
            item, getThumbnail, onLoad, loadTimeout,
        } = this.props;
        const thumbnail = getThumbnail ? getThumbnail(item, this.props) : this.props.thumbnail;
        if (thumbnail !== null && !Card.isLoaded(thumbnail)) {
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
        const { item, getThumbnail, onLoad } = this.props;

        Card.addLoaded(getThumbnail(item, this.props));

        if (onLoad) {
            onLoad();
        }
    }

    renderLabel() {
        const {
            item, getName, getDetails, getDate,
        } = this.props;

        const name = getName !== null ? getName(item, this.props) : null;
        const date = getDate !== null ? getDate(item, this.props) : null;
        const details = getDetails !== null ? getDetails(item, this.props) : null;

        return (
            <div className={styles.label}>
                {name !== null ? <h4 className={styles.name}>{name}</h4> : null}
                {date !== null ? <div className={styles.date}>{date}</div> : null}
                {details !== null ? (
                    <div className={styles.details}>
                        {Object.keys(details).map(key => (
                            <div className={styles.detail}>
                                {key}: {details[key]}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    render() {
        const {
            item,
            vertical,
            selectable,
            deletable,
            className,
            renderLabel,
            getThumbnail,
            getIcon,
            onClickDelete,
            onClickSelect,
        } = this.props;

        const thumbnail = getThumbnail !== null ? getThumbnail(item, this.props) : null;
        const icon = getIcon !== null ? getIcon(item, this.props) : null;

        const fieldClassNames = classNames({
            [styles.container]: true,
            [styles.vertical]: vertical,
            [className]: className !== null,
        });

        const colsClassNames = classNames({
            [styles.cols]: !vertical,
        });

        const thumbnailColClassNames = classNames({
            [styles.col]: !vertical,
            [styles.middle]: !vertical,
        });

        const infoColClassNames = classNames({
            [styles.col]: !vertical,
            [styles.middle]: !vertical,
            [styles.expand]: true,
        });

        const labelColClassNames = classNames({
            [styles.col]: true,
            [styles.middle]: true,
            [styles.expand]: true,
        });

        const actionsColClassNames = classNames({
            [styles.col]: true,
            [styles.middle]: true,
        });

        const actionsClassNames = classNames({
            [styles.actions]: true,
        });

        return (
            <div className={fieldClassNames}>
                <div className={colsClassNames}>
                    {thumbnail ? (
                        <div className={thumbnailColClassNames}>
                            <div
                                className={styles.thumbnail}
                                style={{
                                    backgroundImage: `url("${thumbnail}")`,
                                }}
                            />
                        </div>
                    ) : (
                        icon
                    )}
                    <div className={infoColClassNames}>
                        <div className={colsClassNames}>
                            <div className={labelColClassNames}>
                                {renderLabel
                                    ? renderLabel(item, this.renderLabel())
                                    : this.renderLabel()}
                            </div>
                            <div className={actionsColClassNames}>
                                <div className={actionsClassNames}>
                                    <div className="btn-group">
                                        {deletable ? (
                                            <button
                                                type="button"
                                                className="btn btn-default"
                                                onClick={onClickDelete}
                                            >
                                                <span className="fa fa-trash" />
                                            </button>
                                        ) : null}
                                        {selectable ? (
                                            <button
                                                type="button"
                                                className="btn btn-default"
                                                onClick={onClickSelect}
                                            >
                                                <span className="fa fa-plus" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Card.loadedThumbnails = loadedThumbnails;
Card.propTypes = propTypes;
Card.defaultProps = defaultProps;

export default Card;