/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
// import sinon from 'sinon';
import UrlField from '../UrlField';

test('match snapshot', () => {
    const component = renderer.create((
        <UrlField
            label="Label"
            value="https://google.com"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<UrlField value="https://google.com" />);
    expect(field.find('input').prop('value')).toEqual('google.com');

    const nullField = shallow(<UrlField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
