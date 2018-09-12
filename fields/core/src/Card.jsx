import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import get from 'lodash/get';
import isArray from 'lodash/isArray';

import styles from './styles/card.scss';

const getFromPath = (item, path) => (
    (isArray(path)
        ? path.map(subPath => get(item, subPath, null)).find(it => it !== null) || null
        : get(item, path, null))
);

const propTypes = {
    item: PropTypes.shape({
        name: PropTypes.string,
        created_at: PropTypes.string,
    }).isRequired,
    thumbnail: PropTypes.string,
    vertical: PropTypes.bool,
    deletable: PropTypes.bool,
    selectable: PropTypes.bool,
    deleteIcon: PropTypes.string,
    selectIcon: PropTypes.string,
    className: PropTypes.string,
    withoutBorder: PropTypes.bool,
    thumbnailSize: PropTypes.string,
    renderLabel: PropTypes.func,
    namePath: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    detailsPath: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    datePath: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    thumbnailPath: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    iconPath: PropTypes.oneOfType([ // eslint-disable-line react/no-unused-prop-types
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
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
    thumbnailSize: 'contain',
    deleteIcon: 'fas fa-times',
    selectIcon: 'fas fa-plus',
    className: null,
    withoutBorder: false,
    renderLabel: null,
    namePath: 'name',
    detailsPath: 'details',
    datePath: 'created_at',
    thumbnailPath: 'thumbnail',
    iconPath: 'icon',
    getName: (item, { namePath }) => getFromPath(item, namePath),
    getDetails: (item, { detailsPath }) => getFromPath(item, detailsPath),
    getThumbnail: (item, { thumbnailPath }) => getFromPath(item, thumbnailPath),
    getIcon: (item, { iconPath }) => getFromPath(item, iconPath),
    getDate: (item, { datePath }) => {
        const date = getFromPath(item, datePath);
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
            item, getThumbnail, thumbnail, onLoad, loadTimeout,
        } = this.props;
        const finalThumbnail = getThumbnail ? getThumbnail(item, this.props) : thumbnail;
        if (finalThumbnail !== null && !Card.isLoaded(finalThumbnail)) {
            this.thumbnail = document.createElement('img');
            this.thumbnail.addEventListener('load', this.onThumbnailLoad);
            this.thumbnail.src = finalThumbnail;
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
                {name !== null ? (
                    <h5
                        className={classNames({
                            'card-title': true,
                            'mb-1': date !== null,
                            'mb-2': date === null,
                            [styles.name]: true,
                        })}
                    >
                        {name}
                    </h5>
                ) : null}
                {date !== null ? (
                    <h6
                        className={classNames({
                            'card-subtitle': true,
                            'mb-2': true,
                            'text-muted': true,
                            [styles.date]: true,
                        })}
                    >
                        {date}
                    </h6>
                ) : null}
                {details !== null ? (
                    <div className={styles.details}>
                        {Object.keys(details).map(key => (
                            <p key={`details-${key}`} className={styles.detail}>
                                {key}: {details[key]}
                            </p>
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
            deleteIcon,
            selectIcon,
            className,
            withoutBorder,
            thumbnailSize,
            renderLabel,
            getThumbnail,
            getIcon,
            onClickDelete,
            onClickSelect,
        } = this.props;

        const thumbnail = getThumbnail !== null ? getThumbnail(item, this.props) : null;
        const icon = getIcon !== null ? getIcon(item, this.props) : null; // eslint-disable-line

        const fieldClassNames = classNames({
            card: true,
            [styles.container]: true,
            [styles.vertical]: vertical,
            [styles.withoutBorder]: withoutBorder,
            [className]: className !== null,
        });

        const bodyClassNames = classNames({
            'card-body': true,
        });

        const colsClassNames = classNames({
            [styles.cols]: !vertical,
        });

        const contentColsClassNames = classNames({
            [styles.cols]: true,
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
                {vertical && thumbnail ? <img src={thumbnail} alt={thumbnail} /> : null}
                <div className={bodyClassNames}>
                    <div className={colsClassNames}>
                        {!vertical && thumbnail ? (
                            <div className={thumbnailColClassNames}>
                                <div
                                    className={styles.thumbnail}
                                    style={{
                                        backgroundImage: `url("${thumbnail}")`,
                                        backgroundSize: thumbnailSize,
                                    }}
                                />
                            </div>
                        ) : null}
                        <div className={infoColClassNames}>
                            <div className={contentColsClassNames}>
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
                                                    className={classNames({
                                                        btn: true,
                                                        'btn-light': true,
                                                        [deleteIcon]: true,
                                                    })}
                                                    onClick={onClickDelete}
                                                />
                                            ) : null}
                                            {selectable ? (
                                                <button
                                                    type="button"
                                                    className={classNames({
                                                        btn: true,
                                                        'btn-light': true,
                                                        [selectIcon]: true,
                                                    })}
                                                    onClick={onClickSelect}
                                                />
                                            ) : null}
                                        </div>
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
