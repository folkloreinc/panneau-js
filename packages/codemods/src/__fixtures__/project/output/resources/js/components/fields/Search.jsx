import PropTypes from 'prop-types';
import React from 'react';

// A field of the site's own forms, not of Panneau: the codemods leave it alone.
function Search({ value, onChange }) {
    return (
        <input
            type="search"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

Search.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

Search.defaultProps = {
    value: null,
};

export default Search;
